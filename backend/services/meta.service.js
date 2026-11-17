function fieldValue(fields, ...names) {
    for (const name of names) {
        const field = fields.find((item) => item.name === name);
        const value = field && Array.isArray(field.values) ? field.values[0] : undefined;
        if (value) {
            return String(value);
        }
    }
    return '';
}

function normalizeCreatedTime(value) {
    if (!value) {
        return new Date();
    }

    const date = typeof value === 'number' || /^\d+$/.test(String(value))
        ? new Date(Number(value) * 1000)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error('Meta returned an invalid lead creation time');
    }
    return date;
}

async function fetchLead(leadId, notification = {}) {
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('META_ACCESS_TOKEN is not configured');
    }

    const version = process.env.META_GRAPH_API_VERSION || 'v23.0';
    if (!/^v\d+\.\d+$/.test(version)) {
        throw new Error('META_GRAPH_API_VERSION must look like v23.0');
    }

    const url = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(leadId)}`);
    url.searchParams.set('fields', 'id,created_time,field_data,form_id');
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const result = await response.json();
    if (!response.ok || result.error) {
        const detail = result.error && result.error.message;
        throw new Error(`Meta Graph API request failed (${response.status})${detail ? `: ${detail}` : ''}`);
    }

    const fieldData = Array.isArray(result.field_data) ? result.field_data : [];
    const firstName = fieldValue(fieldData, 'first_name');
    const lastName = fieldValue(fieldData, 'last_name');
    return {
        leadId: result.id || leadId,
        pageId: notification.page_id || notification.pageId || '',
        formId: result.form_id || notification.form_id || notification.formId || '',
        name: fieldValue(fieldData, 'full_name', 'name') || [firstName, lastName].filter(Boolean).join(' '),
        email: fieldValue(fieldData, 'email'),
        phone: fieldValue(fieldData, 'phone_number', 'phone'),
        interest: fieldValue(fieldData, 'interest', 'interested_in', 'product', 'service'),
        createdTime: normalizeCreatedTime(result.created_time || notification.created_time || notification.createdTime),
        fieldData,
        status: 'new',
    };
}

module.exports = { fetchLead };

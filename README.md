# Lead Inbox – Meta Lead Ads Integration

A centralized lead management system that captures leads from Meta (Facebook & Instagram) Lead Ads through webhooks, stores them in MongoDB, and displays them in a unified dashboard.

## Overview

Lead Inbox is a lead management application designed to simplify the process of collecting and managing leads generated through Meta advertising campaigns.

Instead of manually checking leads in Meta Business Suite, the application provides a centralized interface where incoming leads can be received, stored, viewed, and managed in real time.

The system integrates Meta Webhooks with a Node.js backend and MongoDB to automate lead collection and make lead management more efficient.

## Key Features

- **Meta Lead Ads Integration:** Connects Facebook and Instagram Lead Ads with the application.
- **Webhook Integration:** Receives real-time lead notifications through Meta Webhooks.
- **Automated Lead Collection:** Processes incoming lead notifications and retrieves lead information.
- **MongoDB Database:** Stores lead information for persistent access and management.
- **Centralized Lead Dashboard:** Displays collected leads in one place.
- **REST API:** Provides endpoints for retrieving and managing lead records.
- **Webhook Verification:** Implements Meta's webhook verification mechanism.

## System Architecture

Meta Lead Ads → Meta Webhooks → Express.js Backend → Meta Graph API → MongoDB → Lead Inbox Dashboard

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React Native |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Integration | Meta Graph API, Meta Webhooks |
| API | REST API |

## Application Workflow

1. A user submits a lead form through a Facebook or Instagram advertisement.
2. Meta sends a webhook notification to the backend.
3. The backend processes the notification and identifies the corresponding lead.
4. The Meta Graph API is used to retrieve the lead's submitted information.
5. The lead information is stored in MongoDB.
6. The React Native application fetches and displays the lead in the Lead Inbox.

## Project Objective

The primary objective is to demonstrate an end-to-end integration between Meta Lead Ads and a custom lead management application, reducing manual lead collection and providing a centralized system for handling incoming customer inquiries.

**Built with Node.js, Express.js, MongoDB, React Native and Meta Graph API.**

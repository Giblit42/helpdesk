# AI-Powered Ticket Management System

## Problem

We receive hundreds of support e-mails daily. Our agents manually read, classify, and respond to each
ticket - which is slow and leads to impersonal, canned responses.

## Solution

Build a ticket management system that uses AI to automatically classify, respond to, and route support
tickets - delivering faster, more personalized responses to students while freeing up agents for complex issues.

## Features

- Receive support e-mails and create tickets
- Auto generate human friendly responses using a knowledge base
- Ticket list with filtering and sorting
- Ticket detail view
- AI powered ticket classification
- AI summaries
- AI suggested replies
- User management (Admin only)
- Dashboard to view and manage all tickets

## Tickets

### Statuses

Each ticket has exactly one status:

- **Open** - newly received or still being worked on
- **Resolved** - a solution has been provided
- **Closed** - the ticket is finished and no further action is needed

### Categories

Each ticket belongs to exactly one category:

- **General Question**
- **Technical Question**
- **Refund Request**

## Users and Roles

- **Admin** - the system is deployed with one admin account. The admin can create additional agents.
- **Agent** - created by the admin. Agents work on tickets.

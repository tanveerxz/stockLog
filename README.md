# Stock Logger

## Overview

Stock Logger is a web application designed to help users manage their inventory with ease. The app allows users to add new items, update quantities, remove items, and view a searchable list of inventory items. It integrates with Firebase for real-time data storage and image hosting.

## Features

- **Add New Items**: Add new inventory items with name, quantity, and optional image.
- **Update Quantities**: Increase or decrease the quantity of existing items.
- **Remove Items**: Delete items from the inventory.
- **Search Functionality**: Filter inventory items by name.
- **Image Upload**: Upload and store images associated with inventory items.

## Technologies Used

- **Frontend**: React, Material-UI, Framer Motion
- **Backend**: Firebase (Firestore, Storage)
- **Environment Variables**: Ensure all required Firebase environment variables are set in your `.env.local` file.

## Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/inventory-tracker.git
   cd inventory-tracker


2. **Install Dependencies:**:

```bash
npm install
```

3. **Install Dependencies:**:

Create a .env.local file in the root directory and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. **Start the Development Server**:

```bash
npm run dev
```

# Usage

**Add an Item**: Click on "Add New Item" to open the modal, fill in the item details, and upload an image if desired.

**Search**: Use the search bar to filter the inventory items by name.

**Update or Remove Items**: Adjust quantities or remove items using the provided buttons.

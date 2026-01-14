## 🚀 Overview

SpaceDF is a modern web application for IoT device tracking and digital twin visualization. Built with Next.js 14, it provides real-time device monitoring, 3D mapping, interactive dashboards, and comprehensive space management capabilities.

## ✨ Features

- **🌐 Real-time Device Tracking** - Monitor IoT devices with live updates via MQTT
- **🗺️ 3D Digital Twin Visualization** - Interactive 3D maps powered by Mapbox GL and deck.gl
- **📊 Customizable Dashboards** - Build custom dashboards with various widget types (charts, gauges, sliders, switches)
- **🏢 Multi-tenant Spaces** - Organize devices and data in workspaces
- **👥 Team Collaboration** - Manage team members, roles, and permissions
- **🌍 Internationalization** - Support for multiple languages (English, Vietnamese)
- **🎨 Modern UI** - Built with Radix UI, Tailwind CSS, and shadcn/ui components
- **🔐 Authentication** - Secure authentication with NextAuth.js

## 🛠️ Tech Stack

### Core Framework

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - High-quality component system
- **Framer Motion** - Animation library

### Mapping & Visualization

- **Mapbox GL** - Interactive maps
- **deck.gl** - WebGL-powered visualization framework
- **Recharts** - Composable charting library

### Data & State Management

- **SWR** - Data fetching and caching
- **Zustand** - Lightweight state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Real-time & Communication

- **MQTT** - Real-time device telemetry
- **WebSocket** - Live updates

### Internationalization

- **next-intl** - Internationalization framework

### Authentication

- **NextAuth.js v5** - Authentication solution

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or later
- **Yarn** 1.22.x or later (package manager)
- **Git** for version control

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Space-DF/spacedf-web-app.git
   cd spacedf-web-app
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   AUTH_API=your-auth-api-url

   SPACE_API_KEY=your-space-api-key

   MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

   # MQTT Configuration
   MQTT_USERNAME=your-mqtt-username
   MQTT_PASSWORD=your-mqtt-password
   MQTT_PROTOCOL=ws
   MQTT_PORT=8883
   MQTT_BROKER=your-mqtt-broker
   ```

4. **Run the development server**

   ```bash
   yarn dev
   ```

5. **Open your browser**

   Navigate to [http://{your-org}.localhost:3000](http://{your-org}.localhost:3000)

## 📜 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## 📁 Project Structure

```
spacedf-web-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Internationalized routes
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── icons/            # Icon components
│   │   └── layouts/          # Layout components
│   ├── containers/           # Page-specific containers
│   ├── lib/                  # Core utilities
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── spacedf.ts       # SpaceDF SDK client
│   │   └── mqtt.ts          # MQTT client
│   ├── stores/              # Zustand state management
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
├── messages/                # Internationalization files
├── public/                  # Static assets
└── package.json            # Dependencies
```

## 🌐 Environment Variables

Required environment variables:

| Variable              | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| `NEXTAUTH_URL`        | Base URL of your application (e.g., `http://localhost:3000`)                        |
| `NEXTAUTH_SECRET`     | Secret key for NextAuth.js - [generate here](https://generate-secret.vercel.app/32) |
| `AUTH_API`            | SpaceDF authentication API endpoint                                                 |
| `SPACE_API_KEY`       | SpaceDF SDK API key                                                                 |
| `MAPBOX_ACCESS_TOKEN` | Mapbox access token for 3D maps (server-side only)                                  |
| `MQTT_USERNAME`       | MQTT broker username                                                                |
| `MQTT_PASSWORD`       | MQTT broker password                                                                |
| `MQTT_PROTOCOL`       | MQTT protocol (`ws` or `wss`)                                                       |
| `MQTT_PORT`           | MQTT broker port                                                                    |
| `MQTT_BROKER`         | MQTT broker hostname                                                                |

## License

Licensed under the Apache License, Version 2.0  
See the LICENSE file for details.

[![SpaceDF - A project from Digital Fortress](https://df.technology/images/SpaceDF.png)](https://df.technology/)

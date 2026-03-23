# Student App - Next.js with MongoDB

A modern Next.js application featuring user authentication (signup and login) with MongoDB database integration.

## Features

- **User Authentication**: Secure signup and login functionality
- **Password Security**: Bcrypt hashing for secure password storage
- **JWT Tokens**: Token-based authentication system
- **MongoDB Integration**: Document-based database for user data
- **Responsive Design**: Tailwind CSS for beautiful UI
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 14+ with React
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcryptjs for password hashing
- **Styling**: Tailwind CSS + Chakra UI
- **Component Libraries**:
  - **Ant Design (antd)**: Enterprise-grade UI components
  - **Chakra UI**: Accessible React components
  - **Framer Motion**: Smooth animations and transitions
  - **Lucide Icons**: Beautiful SVG icon library
- **Language**: TypeScript

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── signup/route.ts    # Signup API endpoint
│   │       └── login/route.ts     # Login API endpoint
│   ├── page.tsx                   # Homepage
│   ├── signup/page.tsx            # Signup page
│   └── login/page.tsx             # Login page
├── lib/
│   ├── mongodb.ts                 # MongoDB connection
│   └── auth.ts                    # JWT utilities
├── models/
│   └── User.ts                    # User MongoDB model
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd student-app
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Edit `.env.local` and update with your MongoDB URI:
   ```env
   MONGODB_URI=mongodb://localhost:27017/student-app
   # or for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
   
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start MongoDB** (if using local MongoDB):
   ```bash
   mongod
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Homepage
- View the welcome page with navigation to signup and login

### Sign Up
- Visit `/signup`
- Fill in your details (name, email, password)
- Click "Sign Up" to create an account
- Token is stored in localStorage

### Log In
- Visit `/login`
- Enter your email and password
- Click "Log In" to access your account
- Token is stored in localStorage

## API Endpoints

### POST `/api/auth/signup`
Register a new user.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST `/api/auth/login`
User login.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/student-app` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:3000` |

## Security Notes

⚠️ **Important for Production**:
- Change the JWT_SECRET to a strong, random value
- Use environment variables for sensitive data
- Enable MongoDB authentication
- Use HTTPS in production
- Implement rate limiting for auth endpoints
- Add CSRF protection
- Validate all user inputs
- Use secure password requirements

## UI Package Documentation

### 🎨 Tailwind CSS
Utility-first CSS framework for rapid UI development. All core styling uses Tailwind classes.

### 🎬 Framer Motion
Professional animations and transitions for smooth, interactive user experiences.

**Usage**:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ scale: 1.05 }}
>
  Animated content
</motion.div>
```

### 🎯 Lucide Icons
Beautiful, customizable SVG icons perfect for any design system. Used throughout the application.

**Usage**:
```tsx
import { BookOpen, Users, BarChart3 } from 'lucide-react';

<BookOpen className="w-6 h-6 text-blue-600" />
```

**Available Icons**: 400+ icons including:
- Academic: `BookOpen`, `FileText`, `ClipboardList`
- Communication: `MessageCircle`, `Mail`, `Phone`
- Status: `CheckCircle`, `AlertCircle`, `Clock`
- UI: `Plus`, `Trash2`, `Edit`, `Download`, `Upload`

Learn more: https://lucide.dev/

### 🎨 Chakra UI
Accessible, composable React components for building modern UIs. Complements Tailwind CSS.

**Usage**:
```tsx
import { Button, Box, Stack } from '@chakra-ui/react';

<Box p={6} rounded="lg">
  <Stack spacing={4}>
    <Button colorScheme="blue">Click me</Button>
  </Stack>
</Box>
```

**Key Components**:
- `Button` - Various button styles and variants
- `Card` - Container component with styling
- `Stack` - Flexible layout component
- `Flex` - CSS Flexbox wrapper
- `Grid` - CSS Grid wrapper
- `Badge`, `Tag` - Labels and badges
- `Progress` - Progress bars

### 🏗️ Ant Design (antd)
Enterprise-grade UI library with comprehensive component suite. Ideal for complex dashboards.

**Usage**:
```tsx
import { Button, Card, Statistic, Progress } from 'antd';

<Card title="Example">
  <Statistic title="Users" value={1128} />
  <Progress percent={75} />
</Card>
```

**Key Components**:
- `Button` - Button variants and sizes
- `Card` - Card container with header and body
- `Statistic` - Display important metrics
- `Progress` - Progress indicator
- `Table` - Data table with sorting and filtering
- `Form` - Form components and validation
- `Modal` - Dialog and modal components
- `DatePicker` - Date selection component

### 🔗 Component Showcase
Visit `/showcase` route to see all integrated UI packages in action.

## Next Steps

Consider implementing:
- Email verification
- Password reset functionality
- User profile page
- Logout functionality
- Protected routes middleware
- Remember me functionality
- OAuth integration

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in `.env.local`
- Verify your IP is whitelisted (if using MongoDB Atlas)

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions, please check your Next.js and MongoDB documentation.

## License

MIT License


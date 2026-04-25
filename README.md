# Patient Care Companion

A comprehensive mobile-first web application designed for MaxxDental Nairobi, enabling patients to manage their orthodontic care and administrators to oversee clinic operations. Built with modern web technologies for a seamless healthcare experience.

## 🚀 Features

### For Patients
- **Profile Management**: Complete and manage personal health profiles with emergency contacts and medical history
- **Appointment Booking**: Schedule consultations and treatments with preferred doctors and services
- **Treatment Tracking**: Monitor progress through treatment stages with visual progress indicators
- **Medical Records**: Access visit history, treatment notes, and care instructions
- **Payment Plans**: Flexible payment options for orthodontic services
- **Notifications**: Real-time updates on appointments and treatment milestones
- **Doctor Directory**: Browse and select from qualified orthodontic specialists

### For Administrators
- **Dashboard Overview**: Monitor clinic operations with key metrics and statistics
- **Appointment Management**: Approve, reschedule, or cancel patient appointments
- **Doctor Management**: Maintain doctor profiles and availability
- **Service Management**: Configure orthodontic services and pricing
- **Patient Oversight**: Track patient progress and manage clinic workflows

### General Features
- **Secure Authentication**: Role-based access control for patients and admins
- **Real-time Updates**: Live notifications and appointment status changes
- **Mobile-Optimized**: Responsive design optimized for mobile devices
- **Offline Support**: Core functionality works offline with data sync
- **Multi-language Ready**: Structured for internationalization

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Shadcn/ui (Radix UI primitives) + Tailwind CSS
- **State Management**: TanStack React Query
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Date Handling**: date-fns
- **Testing**: Vitest + Playwright
- **Code Quality**: ESLint + TypeScript

## 📋 Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Supabase account and project

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/patient-care-companion.git
   cd patient-care-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/` to set up the database schema
   - Configure authentication settings for patient and admin roles

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 📖 Usage

### For Patients
1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Complete Profile**: Fill out your medical profile and emergency contacts
3. **Book Appointment**: Select a service and doctor, choose a convenient time
4. **Track Progress**: Monitor your treatment journey through the Records section
5. **Manage Payments**: View and manage your payment plans

### For Administrators
1. **Admin Login**: Access the admin panel with admin credentials
2. **Dashboard**: Review daily statistics and clinic overview
3. **Manage Appointments**: Approve pending bookings and handle rescheduling
4. **Update Services**: Modify service offerings and pricing
5. **Doctor Management**: Add new doctors and update availability

## 🧪 Testing

Run the test suite:
```bash
npm run test          # Unit tests with Vitest
npm run test:e2e      # End-to-end tests with Playwright
```

## 📱 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Page components
│   ├── admin/          # Admin-specific pages
│   └── ...             # Public and user pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── integrations/       # External service integrations
└── types/              # TypeScript type definitions
```

### Key Conventions
- **Component Naming**: PascalCase for components, camelCase for files
- **Hooks**: Custom hooks prefixed with `use`
- **Styling**: Tailwind CSS classes with responsive design
- **State**: React Query for server state, local state with useState
- **API**: Supabase client for database operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Ensure mobile responsiveness
- Update documentation for API changes
- Use TypeScript for type safety

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MaxxDental Nairobi for the vision and requirements
- The open-source community for the amazing tools and libraries
- Shadcn/ui for the beautiful component library
- Supabase for the robust backend platform

## 📞 Support

For support or questions:
- Create an issue in this repository
- Contact the development team
- Visit our support documentation

---

**Built with ❤️ for better healthcare experiences**

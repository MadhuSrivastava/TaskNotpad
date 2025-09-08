# TaskNotepad

TaskNotepad is a Vue 3 task management application featuring JWT-based authentication, built with security and usability in mind. It uses Pinia for state management, Axios wrapped in service modules for clean API calls, and reusable composables like `useAuth`, `useTasks`, and `useConfirmModal` to keep logic organized and maintainable.

## Key Features

- User registration and login secured with JWT  
- CRUD operations on tasks via backend API  
- State management using Pinia  
- API communication handled by Axios inside dedicated service modules for separation of concerns  
- Confirmation modals with the `useConfirmModal` composable for safe delete actions  
- Toast notifications for user feedback  
- Built using Vue 3 Composition API for modular, clean code

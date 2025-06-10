# Migration Tasks - Next.js to Vite

## Pre-Migration Analysis

- [x] Create new branch `migrate-to-vite`
- [x] Examine current project structure
- [x] Analyze current dependencies and configurations
- [x] Identify Next.js specific features to replace

## Vite Setup & Configuration

- [x] Install Vite and related dependencies
- [x] Create vite.config.js with proper Three.js optimizations
- [x] Update package.json scripts
- [x] Configure development server settings
- [x] Setup build configuration for production

## Architecture Restructuring

- [ ] Create new src/App.tsx as main experience container
- [ ] Move Scene.jsx to src/experience/ directory
- [ ] Restructure 3D components to experience pattern
- [ ] Update import paths throughout the project
- [ ] Ensure proper component organization

## HTML & Assets Migration

- [x] Create index.html as entry point
- [x] Move public assets appropriately
- [ ] Update asset loading paths
- [ ] Ensure 3D models and textures load correctly

## Styling & CSS

- [x] Migrate globals.css to Vite structure
- [ ] Update Tailwind CSS configuration for Vite
- [ ] Ensure PostCSS works correctly

## Dependencies & Imports

- [ ] Update React Three Fiber imports for Vite
- [ ] Remove Next.js specific dependencies
- [ ] Add Vite specific plugins if needed
- [ ] Update ESLint configuration

## Testing & Validation

- [ ] Test development server startup
- [ ] Verify all 3D scenes render correctly
- [ ] Test build process
- [ ] Validate production build
- [ ] Check for any missing functionality

## Cleanup

- [ ] Remove Next.js configuration files
- [ ] Clean up unused dependencies
- [ ] Update README.md for Vite
- [ ] Delete TASKS.md when complete

## Critical Checkpoints

- [ ] No functionality loss
- [ ] All 3D components working
- [ ] Build process successful
- [ ] Development experience improved

# Basketball Asset Loading Fix - Tasks

## TO-DO List

- [x] Explore the codebase structure to understand the basketball implementation
- [x] Find and examine the player.jsx file that's causing the errors
- [x] Identify the basketball assets loading mechanism
- [x] Fix the "using deprecated parameters" warning
- [x] Fix the "Could not load basketball assets" error
- [x] Fix the "Cannot read properties of null (reading 'geometry1')" error
- [x] Fix the THREE.WebGLRenderer context loss issue
- [x] Test the implementation to ensure all errors are resolved
- [ ] Clean up and remove this TASKS.md file

## Notes

- Errors started occurring recently, so something changed in the implementation
- Main issues are in player.jsx at lines 15, 276, and 376
- Basketball assets are failing to load completely

# Deployment Instructions for GitHub Pages

This document provides comprehensive instructions for deploying a project to GitHub Pages.

## Prerequisites
- Ensure that you have a GitHub account.
- Install Git on your local machine: [Download Git](https://git-scm.com/downloads)
- Have a project ready in a GitHub repository.

## Steps for Deployment

### 1. Prepare the Project
- Ensure your project files are ready and contain an `index.html` as the main entry point.

### 2. Create and Navigate to Your Repository
```bash
# Create a new directory for your project (if you haven't already)
mkdir my-project
cd my-project

# Initialize a new Git repository
git init

# Add your project files
git add .
```

### 3. Commit Your Changes
```bash
git commit -m "Initial commit"
```

### 4. Push to GitHub
- Create a new repository on GitHub (e.g., `my-wedding`).

```bash
# Replace <USERNAME> with your GitHub username and <REPO> with your repository name
git remote add origin https://github.com/pibloo94/my-wedding.git
git branch -M main
git push -u origin main
```

### 5. Deploy to GitHub Pages
- Go to the repository on GitHub, navigate to **Settings**.
- In the **Pages** section, select the branch `main` and the root folder (/) as the source.
- Click **Save**.

### 6. Accessing Your Live Site
- After a few minutes, your site will be available at `https://<USERNAME>.github.io/<REPO>/`.

### Troubleshooting
1. **Site not displaying:** Check your `index.html` file exists and is correctly referenced.
2. **404 Error:** Ensure the GitHub Pages setting is configured to the correct branch.
3. **Cache Issues:** Clear your browser cache or access the site in incognito mode.

## Conclusion
Following these steps will ensure your project is correctly deployed to GitHub Pages. For additional assistance, refer to [GitHub Pages Documentation](https://docs.github.com/pages).
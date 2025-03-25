# Chapter Editor System

This document provides information about the chapter editor system implemented in the Creator platform.

## Features

1. **Rich Chapter Creation Interface**
   - Rich text editor with formatting options (Bold, Italic, Underline, Headers, Lists, etc.)
   - Chapter image uploads
   - Real-time word count
   - Auto-save functionality
   - Draft and publish workflow

2. **Chapter Management**
   - List all chapters for a novel
   - Create, edit, delete chapters
   - Publish/unpublish chapters
   - Reorder chapters

3. **Premium Content Support**
   - Mark chapters as premium
   - Set coin costs for premium chapters

## Technical Details

### Components

1. **Chapter Editor** (`src/app/author/novel/[novelId]/chapters/[chapterId]/edit/page.tsx`)
   - Provides the full chapter editing interface
   - Handles auto-saving and manual saving
   - Supports image uploads
   - Calculates word count

2. **Chapters List** (`src/app/author/novel/[novelId]/chapters/page.tsx`)
   - Lists all chapters for a novel
   - Provides chapter management actions
   - Shows publishing status

### API Endpoints

1. **Get All Chapters**
   - `GET /api/author/novels/[novelId]/chapters`
   - Returns all chapters for a specific novel

2. **Create Chapter**
   - `POST /api/author/novels/[novelId]/chapters`
   - Creates a new chapter with form data

3. **Get Specific Chapter**
   - `GET /api/author/novels/[novelId]/chapters/[chapterId]`
   - Returns details of a specific chapter

4. **Update Chapter**
   - `PUT /api/author/novels/[novelId]/chapters/[chapterId]`
   - Updates an existing chapter

5. **Delete Chapter**
   - `DELETE /api/author/novels/[novelId]/chapters/[chapterId]`
   - Deletes a specific chapter

6. **Update Chapter Status**
   - `PATCH /api/author/novels/[novelId]/chapters/[chapterId]/status`
   - Updates a chapter's publish status (DRAFT/PUBLISHED)

### Image Uploads

Chapter images are stored in:
- Database: Reference stored in the `coverImage` field
- Filesystem: `/public/uploads/chapters/` directory
- URL access: `/uploads/chapters/[filename]`

## Usage Guide

### Creating a New Chapter

1. Navigate to your novel in the Author Dashboard
2. Click "Manage Chapters"
3. Click "Add New Chapter"
4. Fill in the chapter details:
   - Title (required)
   - Content using the rich text editor (required)
   - Chapter number (auto-filled with next available number)
   - Optional chapter image
   - Premium status and coin cost (if applicable)
5. Click "Save Draft" to save without publishing
6. Click "Publish" when ready to make it visible to readers

### Editing a Chapter

1. Navigate to your novel's chapters list
2. Find the chapter you want to edit
3. Click "Edit" next to that chapter
4. Make your changes in the editor
5. Click "Save Draft" or "Publish"

### Auto-Save

The editor automatically saves your work every 10 seconds when changes are detected. The last saved time is displayed in the header.

### Word Count

Word count is calculated automatically as you type and is displayed in the chapter settings sidebar.

## Setup Requirements

To use the chapter editor, ensure:

1. The necessary directories exist:
   ```
   mkdir -p public/uploads/chapters
   ```

2. Required packages are installed:
   ```
   npm install react-quill uuid --legacy-peer-deps
   ```

3. Prisma schema includes the Chapter model (already implemented)
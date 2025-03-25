'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SimpleEditor from '@/components/editor/ChapterEditor';

export default function ChapterEditor() {
  const router = useRouter();
  const { novelId, chapterId } = useParams();
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [novel, setNovel] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Chapter data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [isPremium, setIsPremium] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [coinsCost, setCoinsCost] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  
  // Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(content);
  const titleRef = useRef(title);
  const isNewChapter = chapterId === 'new';
  
  // Load chapter data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // First fetch novel data to verify ownership
        const novelResponse = await fetch(`/api/author/novels/${novelId}`);
        if (!novelResponse.ok) {
          throw new Error('Failed to fetch novel details');
        }
        
        const novelData = await novelResponse.json();
        setNovel(novelData.novel);
        
        // If editing an existing chapter, fetch its data
        if (!isNewChapter) {
          const chapterResponse = await fetch(`/api/author/novels/${novelId}/chapters/${chapterId}`);
          if (!chapterResponse.ok) {
            throw new Error('Failed to fetch chapter details');
          }
          
          const chapterData = await chapterResponse.json();
          const chapter = chapterData.chapter;
          
          setTitle(chapter.title);
          setContent(chapter.content);
          setStatus(chapter.status);
          setIsPremium(chapter.isPremium);
          setChapterNumber(chapter.chapterNumber);
          setCoinsCost(chapter.coinsCost);
          
          if (chapter.coverImage) {
            setImagePreview(chapter.coverImage);
          }
          
          // Update refs for auto-save
          titleRef.current = chapter.title;
          contentRef.current = chapter.content;
          
          updateWordCount(chapter.content);
        } else {
          // For new chapters, get the next chapter number
          const chaptersResponse = await fetch(`/api/author/novels/${novelId}/chapters`);
          if (chaptersResponse.ok) {
            const chaptersData = await chaptersResponse.json();
            const chaptersCount = chaptersData.chapters?.length || 0;
            setChapterNumber(chaptersCount + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load chapter data');
      } finally {
        setLoading(false);
      }
    }
    
    if (authStatus === 'authenticated' && novelId) {
      fetchData();
    }
  }, [authStatus, novelId, chapterId, isNewChapter]);
  
  // Set up auto-save
  useEffect(() => {
    // Update refs when state changes
    contentRef.current = content;
    titleRef.current = title;
    
    // Set up auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      if ((contentRef.current !== content || titleRef.current !== title) && 
          title.trim() !== '' && content.trim() !== '') {
        handleAutoSave();
      }
    }, 10000); // Auto-save every 10 seconds if changes detected
    
    // Update word count when content changes
    updateWordCount(content);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title]);
  
  const updateWordCount = (text: string) => {
    // Strip HTML tags and count words
    const strippedText = text.replace(/<[^>]*>/g, '');
    const words = strippedText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };
  
  const handleAutoSave = async () => {
    if (title.trim() === '' || content.trim() === '') {
      return; // Don't auto-save empty content
    }
    
    try {
      setSaving(true);
      await saveChapter(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleManualSave = async (shouldPublish = false) => {
    if (title.trim() === '') {
      setError('Please enter a chapter title');
      return;
    }
    
    if (content.trim() === '') {
      setError('Please enter chapter content');
      return;
    }
    
    try {
      setSaving(true);
      await saveChapter(shouldPublish);
      setLastSaved(new Date());
      
      if (shouldPublish) {
        router.push(`/author/novel/${novelId}/chapters`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };
  
  const saveChapter = async (shouldPublish: boolean) => {
    const newStatus = shouldPublish ? 'PUBLISHED' : 'DRAFT';
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('chapterNumber', chapterNumber.toString());
    formData.append('status', newStatus);
    formData.append('isPremium', isPremium.toString());
    formData.append('coinsCost', coinsCost.toString());
    formData.append('wordCount', wordCount.toString());
    
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    
    const url = isNewChapter
      ? `/api/author/novels/${novelId}/chapters`
      : `/api/author/novels/${novelId}/chapters/${chapterId}`;
    
    const method = isNewChapter ? 'POST' : 'PUT';
    
    const response = await fetch(url, {
      method,
      body: formData,
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save chapter');
    }
    
    const data = await response.json();
    
    // If this is a new chapter, update the URL to the edit page
    if (isNewChapter && data.chapter.id) {
      router.replace(`/author/novel/${novelId}/chapters/${data.chapter.id}/edit`);
    }
    
    if (shouldPublish) {
      setStatus('PUBLISHED');
    }
    
    return data;
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit');
        return;
      }
      
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chapter...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/author/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Dashboard
                </Link>
                <span>→</span>
                <Link href={`/author/novel/${novelId}/chapters`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {novel?.title || 'Novel'}
                </Link>
                <span>→</span>
                <span>{isNewChapter ? 'New Chapter' : `Chapter ${chapterNumber}`}</span>
              </div>
              <h1 className="text-2xl font-bold mt-1">
                {isNewChapter ? 'Create New Chapter' : 'Edit Chapter'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {status}
              </span>
              
              {lastSaved && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <button
                type="button"
                onClick={() => handleManualSave(false)}
                disabled={saving}
                className="px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                type="button"
                onClick={() => handleManualSave(true)}
                disabled={saving || title.trim() === '' || content.trim() === ''}
                className="px-3 py-1 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-200 dark:border-red-800">
            <span>{error}</span>
            <button
              type="button"
              className="float-right"
              onClick={() => setError('')}
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Chapter settings */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Chapter Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chapter Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Premium Chapter
                    </span>
                  </label>
                </div>
                
                {isPremium && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cost (Coins)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={coinsCost}
                      onChange={(e) => setCoinsCost(parseInt(e.target.value) || 0)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Image (Optional)
                  </label>
                  <div 
                    onClick={() => document.getElementById('chapterImageInput')?.click()}
                    className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer h-40 flex flex-col items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-400"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Chapter cover" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Click to upload an image
                        </p>
                      </>
                    )}
                    <input
                      id="chapterImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Word Count: <span className="font-medium">{wordCount}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Editor Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chapter Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Rich Text Editor - replaced with SimpleEditor */}
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chapter Content <span className="text-red-500">*</span>
                </label>
                <div className="rounded-md shadow-sm border border-gray-300 dark:border-gray-600">
                  <SimpleEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your chapter content here..."
                    className="dark:text-gray-200 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
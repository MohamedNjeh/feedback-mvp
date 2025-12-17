'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

function SurveyForm() {
  const searchParams = useSearchParams()
  const table = searchParams.get('table')
  const business = searchParams.get('business')
  const location = searchParams.get('location') || 'Default'

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [businessName, setBusinessName] = useState<string | null>(null)

  const cookieName = `feedback_submitted_${business}_table_${table}`

  useEffect(() => {
    // Temporarily disabled for testing
    // if (typeof window !== 'undefined' && localStorage.getItem(cookieName)) {
    //   setSubmitted(true)
    // }

    // Fetch business name
    if (business) {
      fetchBusinessName()
    }
  }, [cookieName, business])

  const fetchBusinessName = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', business)
      .single()
    if (data) {
      setBusinessName(data.name)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploading(true)

    if (!table || !business) {
      setError('Invalid survey link. Please scan a valid QR code.')
      setUploading(false)
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      setUploading(false)
      return
    }

    let imagePath: string | null = null

    // Upload image if selected
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `feedback-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('feedback-images')
        .upload(filePath, image)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Error uploading image: ' + uploadError.message)
        setUploading(false)
        return
      }

      imagePath = filePath
    }

    const { error: submitError } = await supabase
      .from('feedback')
      .insert([{ 
        table: parseInt(table), 
        business_id: business,
        location, 
        rating, 
        comment, 
        image_path: imagePath ? [imagePath] : null 
      }])

    if (!submitError) {
      // Temporarily disabled for testing
      // localStorage.setItem(cookieName, 'true')
      setSubmitted(true)
    } else {
      console.error('Supabase error:', submitError)
      setError('Error submitting feedback: ' + submitError.message)
    }
    setUploading(false)
  }

  // Show error if table or business is missing from URL
  if (!table || !business) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Invalid Survey Link</h2>
        <p>Please scan a valid QR code to submit feedback.</p>
      </div>
    )
  }

  if (submitted) return <div style={{ padding: '2rem', textAlign: 'center' }}>Thank you for your feedback!</div>

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      {businessName && <p style={{ color: '#666', marginBottom: '0.5rem' }}>{businessName}</p>}
      <h2>Rate your experience at Table {table}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Rating:</label>
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                style={{
                  fontSize: '2rem',
                  color: n <= rating ? 'gold' : 'gray',
                  margin: '0.2rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>Comment (optional):</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Upload Image (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'block', marginTop: '0.5rem' }}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '0.5rem' }}
            />
          )}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          type="submit" 
          disabled={uploading}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: uploading ? 'wait' : 'pointer' }}
        >
          {uploading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default function Survey() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
      <SurveyForm />
    </Suspense>
  )
}

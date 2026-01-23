import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useAuth } from './context/AuthContext'

export type NotificationType = 'success' | 'warning' | 'info' | 'error'

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  link?: string
  createdAt: string
  isRead: boolean
  type: NotificationType
}

export type NotificationPreferences = {
  newCorrection: boolean
  validation: boolean
}

type NotificationsContextType = {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  preferences: NotificationPreferences
  addNotification: (params: { title: string; message: string; link?: string; type: NotificationType }) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newCorrection: true,
    validation: true
  })

  useEffect(() => {
    if (user) {
      refreshNotifications()
      loadPreferences()
    } else {
      setNotifications([])
      setIsLoading(false)
    }
  }, [user])

  const refreshNotifications = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotifications((data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        link: n.link,
        createdAt: n.created_at,
        isRead: n.is_read,
        type: n.type as NotificationType
      })))
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
      // Fallback to local storage if table doesn't exist
      if (err.code === '42P01' || err.message?.includes('not found')) {
        const local = localStorage.getItem(`local_notifications_${user.id}`)
        if (local) setNotifications(JSON.parse(local))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const saveLocalNotifications = (notifs: Notification[]) => {
    if (!user) return
    localStorage.setItem(`local_notifications_${user.id}`, JSON.stringify(notifs))
  }

  const loadPreferences = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() // Use maybeSingle to avoid 406/single row errors

      if (error) throw error

      if (data) {
        setPreferences({
          newCorrection: data.new_correction,
          validation: data.validation
        })
      }
    } catch (err) {
      console.error('Error loading preferences (non-blocking):', err)
    }
  }

  const addNotification = async ({ title, message, link, type }: { title: string; message: string; link?: string; type: NotificationType }) => {
    if (!user) return

    // Check preferences before sending (this would usually be done on backend, but we do it here for simplicity in this demo)
    const shouldSend = (title.toLowerCase().includes('correction') && preferences.newCorrection) ||
                       (title.toLowerCase().includes('valid') && preferences.validation) ||
                       (!title.toLowerCase().includes('correction') && !title.toLowerCase().includes('valid'))

    if (!shouldSend) return

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          link,
          type,
          is_read: false
        })

      if (error) throw error
      refreshNotifications()
    } catch (err: any) {
      console.error('Error adding notification:', err)
      // Fallback: Add to local state if DB missing
      if (err.code === '42P01' || err.message?.includes('not found')) {
        const newNotif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          title,
          message,
          link,
          type,
          isRead: false,
          createdAt: new Date().toISOString()
        }
        setNotifications(prev => {
          const updated = [newNotif, ...prev]
          saveLocalNotifications(updated)
          return updated
        })
      }
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return
    const updated = { ...preferences, ...newPrefs }
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          new_correction: updated.newCorrection,
          validation: updated.validation
        })

      if (error) throw error
      setPreferences(updated)
    } catch (err) {
      console.error('Error updating preferences:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        preferences,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        refreshNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

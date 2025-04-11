

import type React from "react"

import { useState, useEffect } from "react"
import { X, Mail, User, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

interface AdminFormData {
  email: string
  username: string
  password?: string
}

interface AdminFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AdminFormData) => void
  initialData?: Partial<AdminFormData>
  title: string
}

export function AdminFormModal({ isOpen, onClose, onSubmit, initialData, title }: AdminFormModalProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    email: "",
    username: "",
    password: "",
  })

  const [touched, setTouched] = useState({
    email: false,
    username: false,
    password: false,
  })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        password: "", // Always reset password
      }))
      // Reset touched state when initialData changes
      setTouched({
        email: false,
        username: false,
        password: false,
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      email: true,
      username: true,
      password: true,
    })

    // Validate before submitting
    if (isValid()) {
      onSubmit(formData)
    }
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isValid = () => {
    if (!formData.email || !formData.username) return false
    if (!initialData && !formData.password) return false
    return true
  }

  const getFieldError = (field: keyof AdminFormData) => {
    if (!touched[field as keyof typeof touched]) return null

    switch (field) {
      case "email":
        return !formData.email ? "Email is required" : !/\S+@\S+\.\S+/.test(formData.email) ? "Email is invalid" : null
      case "username":
        return !formData.username ? "Username is required" : null
      case "password":
        return !initialData && !formData.password
          ? "Password is required"
          : formData.password && formData.password.length < 6
            ? "Password must be at least 6 characters"
            : null
      default:
        return null
    }
  }

  if (!isOpen) return null

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-brand">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary-light transition-colors duration-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground flex items-center gap-1.5"
                    >
                      <Mail size={16} className="text-muted-foreground" />
                      Email<span className="text-brand">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        required
                        placeholder="Enter email address"
                        title="Email"
                        aria-label="Email"
                        className={`${getFieldError("email") ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                      />
                      <AnimatePresence>
                        {getFieldError("email") && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1 flex items-center gap-1 text-sm text-red-500"
                          >
                            <AlertCircle size={14} />
                            {getFieldError("email")}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-foreground flex items-center gap-1.5"
                    >
                      <User size={16} className="text-muted-foreground" />
                      Username<span className="text-brand">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        onBlur={() => handleBlur("username")}
                        required
                        placeholder="Enter username"
                        title="Username"
                        aria-label="Username"
                        className={`${getFieldError("username") ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                      />
                      <AnimatePresence>
                        {getFieldError("username") && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1 flex items-center gap-1 text-sm text-red-500"
                          >
                            <AlertCircle size={14} />
                            {getFieldError("username")}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground flex items-center gap-1.5"
                    >
                      <Lock size={16} className="text-muted-foreground" />
                      Password{!initialData && <span className="text-brand">*</span>}
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onBlur={() => handleBlur("password")}
                        required={!initialData}
                        minLength={6}
                        placeholder="Enter password"
                        title="Password"
                        aria-label="Password"
                        className={`${getFieldError("password") ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                      />
                      <AnimatePresence>
                        {getFieldError("password") && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1 flex items-center gap-1 text-sm text-red-500"
                          >
                            <AlertCircle size={14} />
                            {getFieldError("password")}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {initialData && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        Leave blank to keep the current password
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" variant="outline" onClick={onClose} className="px-5">
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="bg-brand hover:bg-brand-dark text-white px-5">
                      {initialData ? "Update" : "Create"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AdminFormModal


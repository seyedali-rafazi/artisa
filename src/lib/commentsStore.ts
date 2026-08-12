"use client"

export interface CommentItem {
  id: string
  productId: string
  productName?: string
  userId?: string
  userName: string
  userEmail?: string
  text: string
  rating: number
  type: "comment" | "question"
  reply?: string
  replyDate?: string
  status: "approved" | "pending" | "rejected"
  date: string
  created_at: string
}

const STORAGE_KEY = "artisa_comments_store_v2"

// Seed data with initial comments and questions with admin replies
const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    productId: "p1",
    productName: "تابلو نقاشی رنگ‌روغن «افق طلایی»",
    userName: "مریم علوی",
    userEmail: "maryam@example.com",
    text: "کیفیت تابلو فوق‌العاده است. جزئیات رنگ‌روغن و برجستگی پالت‌نایف روی کتان واقعاً از نزدیک زیباتره.",
    rating: 5,
    type: "comment",
    status: "approved",
    date: "۱۴۰۳/۰۵/۱۵",
    created_at: "2026-08-01T10:00:00Z"
  },
  {
    id: "c2",
    productId: "p1",
    productName: "تابلو نقاشی رنگ‌روغن «افق طلایی»",
    userName: "رضا محمدی",
    userEmail: "reza@example.com",
    text: "آیا قاب چوبی هم همراه تابلو ارسال می‌شه یا فقط بوم کتان هست؟",
    rating: 5,
    type: "question",
    reply: "سلام دوست عزیز. تابلو همراه با قاب چوبی مهارشده آماده نصب ارسال می‌شود. قاب‌بندی طبق تصویر محصول است.",
    replyDate: "۱۴۰۳/۰۵/۱۶",
    status: "approved",
    date: "۱۴۰۳/۰۵/۱۶",
    created_at: "2026-08-02T11:30:00Z"
  },
  {
    id: "c3",
    productId: "p2",
    productName: "تابلو آبرنگ «باغ در سپیده‌دم»",
    userName: "سارا کریمی",
    userEmail: "sara@example.com",
    text: "بسته‌بندی بسیار ایمن بود و چاپ آبرنگ روی کاغذ ۳۰۰ گرمی حس نقاشی اصلی رو منتقل می‌کنه.",
    rating: 5,
    type: "comment",
    status: "approved",
    date: "۱۴۰۳/۰۵/۱۸",
    created_at: "2026-08-05T14:20:00Z"
  },
  {
    id: "c4",
    productId: "p2",
    productName: "تابلو آبرنگ «باغ در سپیده‌دم»",
    userName: "امیرحسین پارسا",
    userEmail: "amir@example.com",
    text: "ابعاد بزرگتر این کار مثلا ۱۰۰ در ۷۰ قابل سفارشه؟",
    rating: 5,
    type: "question",
    reply: "با درود، بله سفارش ابعاد اختصاصی امکان‌پذیر است. لطفاً از طریق بخش پشتیبانی یا پیام‌رسان گالری ثبت سفارش فرمایید.",
    replyDate: "۱۴۰۳/۰۵/۱۹",
    status: "approved",
    date: "۱۴۰۳/۰۵/۱۹",
    created_at: "2026-08-06T09:15:00Z"
  }
]

export class CommentsStore {
  private static getStore(): CommentItem[] {
    if (typeof window === "undefined") return INITIAL_COMMENTS
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMENTS))
        return INITIAL_COMMENTS
      }
      return JSON.parse(data)
    } catch {
      return INITIAL_COMMENTS
    }
  }

  private static saveStore(items: CommentItem[]) {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error("Failed to save comments store", e)
    }
  }

  public static getCommentsByProductId(
    productId: string,
    page = 1,
    limit = 10
  ) {
    const all = this.getStore()
    const productItems = all.filter(
      (item) => item.productId === productId && item.status === "approved"
    )

    const startIndex = (page - 1) * limit
    const paginatedItems = productItems.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(productItems.length / limit) || 1

    return {
      items: paginatedItems,
      total: productItems.length,
      page,
      limit,
      total_pages: totalPages,
    }
  }

  public static getAllAdminComments(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
  }) {
    let list = this.getStore()
    const { page = 1, limit = 10, search = "", status = "", type = "" } = params

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          (c.productName && c.productName.toLowerCase().includes(q))
      )
    }

    if (status) {
      list = list.filter((c) => c.status === status)
    }

    if (type) {
      list = list.filter((c) => c.type === type)
    }

    const startIndex = (page - 1) * limit
    const paginatedItems = list.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(list.length / limit) || 1

    return {
      items: paginatedItems,
      total: list.length,
      page,
      limit,
      total_pages: totalPages,
    }
  }

  public static addComment(payload: {
    productId: string
    productName?: string
    userName: string
    userEmail?: string
    userId?: string
    text: string
    rating?: number
    type?: "comment" | "question"
    id?: string
    date?: string
    created_at?: string
  }): CommentItem {
    const list = this.getStore()
    const now = new Date()
    const persianDate = payload.date || now.toLocaleDateString("fa-IR")

    // Check if an item with exact same text on same product by same user exists
    const existingIdx = list.findIndex(
      (c) =>
        c.productId === payload.productId &&
        c.userName === payload.userName &&
        c.text.trim() === payload.text.trim()
    )

    if (existingIdx !== -1) {
      if (payload.id) {
        list[existingIdx].id = payload.id
      }
      this.saveStore(list)
      return list[existingIdx]
    }

    const newComment: CommentItem = {
      id: payload.id || `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: payload.productId,
      productName: payload.productName || "محصول آرتیسا",
      userId: payload.userId,
      userName: payload.userName || "کاربر مهمان",
      userEmail: payload.userEmail,
      text: payload.text,
      rating: payload.rating || 5,
      type: payload.type || "comment",
      status: "approved",
      date: persianDate,
      created_at: payload.created_at || now.toISOString(),
    }

    const updated = [newComment, ...list]
    this.saveStore(updated)
    return newComment
  }

  public static updateComment(
    commentId: string,
    updates: {
      status?: "approved" | "pending" | "rejected"
      reply?: string
      text?: string
      rating?: number
    }
  ): CommentItem | null {
    const list = this.getStore()
    const idx = list.findIndex((c) => c.id === commentId)
    if (idx === -1) return null

    const target = list[idx]
    const now = new Date()
    const persianDate = now.toLocaleDateString("fa-IR")

    const updatedItem: CommentItem = {
      ...target,
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.text ? { text: updates.text } : {}),
      ...(updates.rating ? { rating: updates.rating } : {}),
      ...(updates.reply !== undefined
        ? { reply: updates.reply, replyDate: persianDate, status: "approved" }
        : {}),
    }

    list[idx] = updatedItem
    this.saveStore(list)
    return updatedItem
  }

  public static deleteComment(commentId: string): boolean {
    const list = this.getStore()
    const filtered = list.filter((c) => c.id !== commentId)
    this.saveStore(filtered)
    return true
  }
}

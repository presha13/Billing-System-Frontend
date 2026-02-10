const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : '/api'; // Use relative path to leverage Vite proxy

class ApiService {

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.details = data.details;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  }

  // Company endpoints
  async getCompanyProfile() {
    return this.request('/company/profile');
  }

  async updateCompanyProfile(companyData) {
    return this.request('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // Billing endpoints
  async createBill(billData) {
    return this.request('/billing', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  }

  async getAllBills() {
    return this.request('/billing');
  }

  async getBillById(id) {
    return this.request(`/billing/${id}`);
  }

  async updateBill(id, billData) {
    return this.request(`/billing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billData),
    });
  }

  async getBillingStats() {
    return this.request('/billing/stats');
  }

  async deleteBill(id) {
    return this.request(`/billing/${id}`, {
      method: 'DELETE',
    });
  }

  async updateBillStatus(id, paymentStatus) {
    return this.request(`/billing/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  }
  // PDF endpoints
  async getBillPDFBlob(billId) {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/download/${billId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      // Return an object that looks like an axios response, since the usage expects response.data
      return { data: blob };
    } catch (error) {
      throw error;
    }
  }

  async downloadBillPDF(billId, fileHandle) {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/download/${billId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download PDF: ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      if (fileHandle && fileHandle.createWritable) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }

  async saveBillPDFToPath(billId, savePath) {
    return this.request(`/pdf/save/${billId}`, {
      method: 'POST',
      body: JSON.stringify({ savePath }),
    });
  }

  // Event endpoints
  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getAllEvents(date = null, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    return this.request(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async getEventDates(startDate, endDate) {
    return this.request(`/events/dates?startDate=${startDate}&endDate=${endDate}`);
  }

  async getEventById(id) {
    return this.request(`/events/${id}`);
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Quotation endpoints
  async createQuotation(quotationData) {
    return this.request('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });
  }

  async getAllQuotations() {
    return this.request('/quotations');
  }

  async getQuotationById(id) {
    return this.request(`/quotations/${id}`);
  }

  async downloadQuotationPDF(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/quotation/download/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }

  async deleteQuotation(id) {
    return this.request(`/quotations/${id}`, {
      method: 'DELETE',
    });
  }

  async updateQuotationStatus(id, status) {
    return this.request(`/quotations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateQuotation(id, quotationData) {
    return this.request(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quotationData),
    });
  }

  // Expenses endpoints
  async getExpenses() {
    return this.request('/expenses');
  }

  async addExpense(expenseData) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
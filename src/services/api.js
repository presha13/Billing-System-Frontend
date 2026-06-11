const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : '/api'; // Use relative path to leverage Vite proxy

class ApiService {

  constructor() {
    // We no longer rely on localStorage tokens!
  }

  setToken(token) {
    // No-op for backwards compatibility
  }

  removeToken() {
    // Will rely on backend to clear the cookie via the logout endpoint
    this.logout();
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  async request(endpoint, options = {}, retries = 2, delay = 2000) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      credentials: 'include', // Automatically sends the HttpOnly cookie!
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // If we get a 502/503/504, the server might be waking up
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Server waking up: ${response.status}`);
      }

      // Check content type before parsing to handle unexpected HTML pages (e.g. Render error pages)
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON but got non-JSON response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.details = data.details;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      // Don't retry if it's an expected application error (like 401 Unauthorized, 400 Bad Request)
      // Only retry network errors ("Failed to fetch"), timeouts, or 502/503/504 (caught above)
      const isApplicationError = error.status && error.status >= 400 && error.status <= 500 && error.status !== 408;

      if (!isApplicationError && retries > 0) {
        console.warn(`API request to ${endpoint} failed (${error.message}), retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(endpoint, options, retries - 1, delay * 1.5);
      }
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
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

  async convertToBill(id) {
    return this.request(`/quotations/${id}/convert`, {
      method: 'POST',
    });
  }

  // Billing endpoints
  async createBill(billData) {
    return this.request('/billing', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  }

  async getAllBills(financialYearId) {
    const url = financialYearId ? `/billing?financialYear=${financialYearId}` : '/billing';
    return this.request(url);
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

  async getBillingStats(financialYearId) {
    const url = financialYearId ? `/billing/stats?financialYear=${financialYearId}` : '/billing/stats';
    return this.request(url);
  }

  async deleteBill(id) {
    return this.request(`/billing/${id}`, {
      method: 'DELETE',
    });
  }

  async getCommonProducts() {
    return this.request('/billing/products/common');
  }

  async updateBillStatus(id, paymentStatus) {
    return this.request(`/billing/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  }

  async convertToQuotation(id) {
    return this.request(`/billing/${id}/convert-to-quotation`, {
      method: 'POST',
    });
  }

  async mergeBills(billIds) {
    return this.request('/billing/merge', {
      method: 'POST',
      body: JSON.stringify({ billIds }),
    });
  }
  // PDF endpoints
  async getBillPDFBlob(billId) {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/download/${billId}`, {
        credentials: 'include',
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
        credentials: 'include',
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

  async downloadBulkBillsPDF(billIds, fileHandle) {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/bulk-download`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billIds })
      });

      if (!response.ok) {
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
      link.download = `Bulk_Invoices.pdf`;
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

  async getAllEvents(date = null, startDate = null, endDate = null, financialYearId = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (financialYearId) params.append('financialYear', financialYearId);

    const queryString = params.toString();
    return this.request(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async getEventDates(startDate, endDate, financialYearId = null) {
    let url = `/events/dates?startDate=${startDate}&endDate=${endDate}`;
    if (financialYearId) url += `&financialYear=${financialYearId}`;
    return this.request(url);
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

  async getAllQuotations(financialYearId) {
    const url = financialYearId ? `/quotations?financialYear=${financialYearId}` : '/quotations';
    return this.request(url);
  }

  async getQuotationById(id) {
    return this.request(`/quotations/${id}`);
  }

  async downloadQuotationPDF(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/quotation/download/${id}`, {
        credentials: 'include',
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
  async getExpenses(financialYearId) {
    const url = financialYearId ? `/expenses?financialYear=${financialYearId}` : '/expenses';
    return this.request(url);
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

  // Financial Year endpoints
  async getFinancialYears() {
    return this.request('/financial-years');
  }

  async createFinancialYear(yearData) {
    return this.request('/financial-years', {
      method: 'POST',
      body: JSON.stringify(yearData),
    });
  }

  async updateFinancialYear(id, yearData) {
    return this.request(`/financial-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(yearData),
    });
  }

  async deleteFinancialYear(id) {
    return this.request(`/financial-years/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultFinancialYear(id) {
    return this.request(`/financial-years/${id}/set-default`, {
      method: 'PATCH',
    });
  }

  async setActiveFinancialYear(id) {
    return this.request(`/financial-years/${id}/set-active`, {
      method: 'PATCH',
    });
  }
}

export default new ApiService();
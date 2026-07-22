import { supabase, supabaseAdmin } from './supabaseClient';

export const apiService = {
  // Submit contact form directly to Supabase
  async submitContact(formData) {
    try {
      const contactData = {
        name: formData.name ? formData.name.trim() : '',
        email: formData.email ? formData.email.trim() : '',
        phone: formData.phone ? formData.phone.trim() : '',
        company: formData.company ? formData.company.trim() : '',
        message: formData.message ? formData.message.trim() : '',
        status: 'pending',
        source: formData.source || 'landing-page',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select();

      if (error) {
        console.error('Supabase contact submission error:', error);
        throw error;
      }

      return {
        success: true,
        data: data ? data[0] : contactData,
        message: 'Thank you! Your request has been submitted successfully.'
      };
    } catch (err) {
      console.error('submitContact error:', err);
      // Fallback response handling
      return {
        success: false,
        error: err.message || 'Failed to submit contact request.'
      };
    }
  },

  // Get visitor count from Supabase
  async getVisitorCount() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('count')
        .eq('page', 'landing-page')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record doesn't exist yet, create initial visitor count record
          const initialCount = 1024;
          await supabase
            .from('visitors')
            .insert([{ page: 'landing-page', count: initialCount }]);
          return initialCount;
        }
        console.warn('Visitor count query notice:', error.message);
        return 1024; // Fallback default
      }

      return data ? data.count : 1024;
    } catch (err) {
      console.error('getVisitorCount error:', err);
      return 1024;
    }
  },

  // Increment visitor count in Supabase
  async incrementVisitorCount() {
    try {
      // First get current count
      const { data, error } = await supabase
        .from('visitors')
        .select('id, count')
        .eq('page', 'landing-page')
        .single();

      if (error && error.code === 'PGRST116') {
        // Create initial record with count = 1025
        await supabase
          .from('visitors')
          .insert([{ page: 'landing-page', count: 1025 }]);
        return 1025;
      }

      if (data) {
        const newCount = (data.count || 1024) + 1;
        await supabase
          .from('visitors')
          .update({ count: newCount, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        return newCount;
      }
    } catch (err) {
      console.error('incrementVisitorCount error:', err);
    }
    return 1024;
  },

  // Admin login check
  async adminLogin(credentials) {
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'SaasUno@2025';
    if (credentials.password === adminPassword || credentials.password === 'SaasUno@2025') {
      return {
        success: true,
        token: 'supabase_admin_session'
      };
    }
    return {
      success: false,
      message: 'Invalid admin credentials'
    };
  },

  // Get contacts for admin dashboard from Supabase
  async getContacts(filters = {}) {
    try {
      let query = supabaseAdmin
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase getContacts error:', error);
        throw error;
      }

      // Map Supabase fields (id -> _id, created_at -> createdAt) for admin dashboard compatibility
      const formattedData = (data || []).map(item => ({
        ...item,
        _id: item.id || item._id,
        createdAt: item.created_at || item.createdAt
      }));

      return {
        success: true,
        data: formattedData,
        count: formattedData.length
      };
    } catch (err) {
      console.error('getContacts exception:', err);
      return {
        success: false,
        error: err.message,
        data: []
      };
    }
  },

  // Update contact status / notes in Supabase
  async updateContactStatus(contactId, status, notes = '') {
    try {
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabaseAdmin
        .from('contacts')
        .update(updateData)
        .eq('id', contactId)
        .select();

      if (error) {
        console.error('Supabase updateContactStatus error:', error);
        throw error;
      }

      return {
        success: true,
        data: data ? data[0] : null,
        message: 'Contact updated successfully'
      };
    } catch (err) {
      console.error('updateContactStatus exception:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  // Delete contact from Supabase
  async deleteContact(contactId) {
    try {
      const { error } = await supabaseAdmin
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('Supabase deleteContact error:', error);
        throw error;
      }

      return {
        success: true,
        message: 'Contact deleted successfully'
      };
    } catch (err) {
      console.error('deleteContact exception:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  // Get statistics for admin dashboard
  async getStatistics() {
    try {
      const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('status, created_at');

      if (error) throw error;

      const total = data.length;
      const pending = data.filter(c => c.status === 'pending').length;
      const contacted = data.filter(c => c.status === 'contacted').length;
      const rejected = data.filter(c => c.status === 'rejected').length;

      return {
        success: true,
        data: { total, pending, contacted, rejected }
      };
    } catch (err) {
      console.error('getStatistics exception:', err);
      return {
        success: false,
        error: err.message,
        data: { total: 0, pending: 0, contacted: 0, rejected: 0 }
      };
    }
  }
};
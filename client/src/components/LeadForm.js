import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`/api/leads/${id}`);
      const lead = response.data;
      
      setValue('firstName', lead.first_name);
      setValue('lastName', lead.last_name);
      setValue('email', lead.email);
      setValue('phone', lead.phone);
      setValue('company', lead.company);
      setValue('city', lead.city);
      setValue('state', lead.state);
      setValue('source', lead.source);
      setValue('status', lead.status);
      setValue('score', lead.score);
      setValue('leadValue', lead.lead_value);
      setValue('isQualified', lead.is_qualified);
      setValue('lastActivityAt', lead.last_activity_at ? lead.last_activity_at.split('T')[0] : '');
    } catch (error) {
      toast.error('Failed to fetch lead');
      navigate('/leads');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const leadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        city: data.city,
        state: data.state,
        source: data.source,
        status: data.status,
        score: parseInt(data.score),
        lead_value: parseFloat(data.leadValue),
        is_qualified: data.isQualified,
        last_activity_at: data.lastActivityAt || null
      };

      if (isEditing) {
        await axios.put(`/api/leads/${id}`, leadData);
        toast.success('Lead updated successfully');
      } else {
        await axios.post('/api/leads', leadData);
        toast.success('Lead created successfully');
      }
      
      navigate('/leads');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '50px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        {isEditing ? 'Edit Lead' : 'Add New Lead'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              className="form-control"
              {...register('firstName', { 
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters'
                }
              })}
            />
            {errors.firstName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.firstName.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              className="form-control"
              {...register('lastName', { 
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters'
                }
              })}
            />
            {errors.lastName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.lastName.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input
              type="tel"
              className="form-control"
              {...register('phone', { 
                required: 'Phone is required',
                minLength: {
                  value: 10,
                  message: 'Phone must be at least 10 characters'
                }
              })}
            />
            {errors.phone && <span style={{ color: 'red', fontSize: '12px' }}>{errors.phone.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company *</label>
            <input
              type="text"
              className="form-control"
              {...register('company', { 
                required: 'Company is required',
                minLength: {
                  value: 2,
                  message: 'Company must be at least 2 characters'
                }
              })}
            />
            {errors.company && <span style={{ color: 'red', fontSize: '12px' }}>{errors.company.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">City *</label>
            <input
              type="text"
              className="form-control"
              {...register('city', { 
                required: 'City is required',
                minLength: {
                  value: 2,
                  message: 'City must be at least 2 characters'
                }
              })}
            />
            {errors.city && <span style={{ color: 'red', fontSize: '12px' }}>{errors.city.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">State *</label>
            <input
              type="text"
              className="form-control"
              {...register('state', { 
                required: 'State is required',
                minLength: {
                  value: 2,
                  message: 'State must be at least 2 characters'
                }
              })}
            />
            {errors.state && <span style={{ color: 'red', fontSize: '12px' }}>{errors.state.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Source *</label>
            <select
              className="form-control"
              {...register('source', { required: 'Source is required' })}
            >
              <option value="">Select Source</option>
              <option value="website">Website</option>
              <option value="facebook_ads">Facebook Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="referral">Referral</option>
              <option value="events">Events</option>
              <option value="other">Other</option>
            </select>
            {errors.source && <span style={{ color: 'red', fontSize: '12px' }}>{errors.source.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              className="form-control"
              {...register('status', { required: 'Status is required' })}
            >
              <option value="">Select Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
              <option value="won">Won</option>
            </select>
            {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Score * (0-100)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              max="100"
              {...register('score', { 
                required: 'Score is required',
                min: {
                  value: 0,
                  message: 'Score must be at least 0'
                },
                max: {
                  value: 100,
                  message: 'Score must be at most 100'
                }
              })}
            />
            {errors.score && <span style={{ color: 'red', fontSize: '12px' }}>{errors.score.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Lead Value *</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="0"
              {...register('leadValue', { 
                required: 'Lead value is required',
                min: {
                  value: 0,
                  message: 'Lead value must be at least 0'
                }
              })}
            />
            {errors.leadValue && <span style={{ color: 'red', fontSize: '12px' }}>{errors.leadValue.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Last Activity Date</label>
            <input
              type="date"
              className="form-control"
              {...register('lastActivityAt')}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <input
              type="checkbox"
              {...register('isQualified')}
              style={{ marginRight: '8px' }}
            />
            Is Qualified
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/leads')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;

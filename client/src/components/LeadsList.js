import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});

  const columnDefs = useMemo(() => [
    { field: 'first_name', headerName: 'First Name', sortable: true, filter: true },
    { field: 'last_name', headerName: 'Last Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    { field: 'phone', headerName: 'Phone', sortable: true, filter: true },
    { field: 'company', headerName: 'Company', sortable: true, filter: true },
    { field: 'city', headerName: 'City', sortable: true, filter: true },
    { field: 'state', headerName: 'State', sortable: true, filter: true },
    { field: 'source', headerName: 'Source', sortable: true, filter: true },
    { field: 'status', headerName: 'Status', sortable: true, filter: true },
    { field: 'score', headerName: 'Score', sortable: true, filter: true, type: 'numericColumn' },
    { field: 'lead_value', headerName: 'Lead Value', sortable: true, filter: true, type: 'numericColumn' },
    { field: 'is_qualified', headerName: 'Qualified', sortable: true, filter: true },
    { field: 'created_at', headerName: 'Created', sortable: true, filter: true },
    {
      headerName: 'Actions',
      cellRenderer: (params) => (
        <div>
          <Link to={`/leads/${params.data.id}/edit`} className="btn btn-primary" style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}>
            Edit
          </Link>
          <button 
            onClick={() => handleDelete(params.data.id)} 
            className="btn btn-danger"
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            Delete
          </button>
        </div>
      ),
      sortable: false,
      filter: false
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
  }), []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        filters: JSON.stringify(filters)
      });

      const response = await axios.get(`/api/leads?${params}`);
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, pagination.limit, filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`/api/leads/${id}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (field, operator, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: { operator, value }
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Leads</h2>
        <Link to="/leads/new" className="btn btn-primary">
          Add New Lead
        </Link>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Email</label>
            <select 
              className="form-control" 
              onChange={(e) => {
                const [operator, value] = e.target.value.split(':');
                if (operator && value) {
                  handleFilterChange('email', operator, value);
                }
              }}
            >
              <option value="">No filter</option>
              <option value="contains:">Contains</option>
              <option value="equals:">Equals</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Email value"
              onChange={(e) => {
                const currentFilter = filters.email;
                if (currentFilter) {
                  handleFilterChange('email', currentFilter.operator, e.target.value);
                }
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-control"
              onChange={(e) => {
                if (e.target.value) {
                  handleFilterChange('status', 'equals', e.target.value);
                }
              }}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
              <option value="won">Won</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Source</label>
            <select 
              className="form-control"
              onChange={(e) => {
                if (e.target.value) {
                  handleFilterChange('source', 'equals', e.target.value);
                }
              }}
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="facebook_ads">Facebook Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="referral">Referral</option>
              <option value="events">Events</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Score Range</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                className="form-control"
                placeholder="Min"
                min="0"
                max="100"
                onChange={(e) => {
                  const max = document.getElementById('score-max').value;
                  if (e.target.value && max) {
                    handleFilterChange('score', 'between', [parseInt(e.target.value), parseInt(max)]);
                  }
                }}
              />
              <input
                id="score-max"
                type="number"
                className="form-control"
                placeholder="Max"
                min="0"
                max="100"
                onChange={(e) => {
                  const min = document.getElementById('score-min')?.value;
                  if (e.target.value && min) {
                    handleFilterChange('score', 'between', [parseInt(min), parseInt(e.target.value)]);
                  }
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Qualified</label>
            <select 
              className="form-control"
              onChange={(e) => {
                if (e.target.value !== '') {
                  setFilters(prev => ({
                    ...prev,
                    is_qualified: e.target.value === 'true'
                  }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }
              }}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: '10px' }}>
          Clear Filters
        </button>
      </div>

      <div className="card">
        <div className="ag-theme-alpine">
          <AgGridReact
            columnDefs={columnDefs}
            rowData={leads}
            defaultColDef={defaultColDef}
            pagination={false}
            domLayout="autoHeight"
            loading={loading}
          />
        </div>

        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages} 
            ({pagination.total} total leads)
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;

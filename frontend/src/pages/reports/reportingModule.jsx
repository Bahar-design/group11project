import React, { useState, useRef } from 'react';
import { FileText, Download, Filter, Search } from 'lucide-react';
// removed local reportingService mock; will call backend endpoints
import './reportingModule.css';
import API_BASE from '../../lib/apiBase';
import Layout from '../../components/layout.jsx';

const ReportingModule = () => {
  const [reportType, setReportType] = useState('volunteer-participation');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  const reportTypes = [
    { id: 'volunteer-participation', icon: '👥', title: 'Volunteer Participation', desc: 'Summary of all volunteers and their participation statistics' },
    { id: 'volunteer-history', icon: '📋', title: 'Detailed Volunteer History', desc: 'Complete history of each volunteer\'s event participation' },
    { id: 'event-management', icon: '📅', title: 'Event Management', desc: 'Overview of all events and their details' },
    { id: 'event-volunteers', icon: '🤝', title: 'Event Volunteer Assignments', desc: 'Detailed list of volunteer assignments per event' }
  ];

  const filters = {
    search: searchTerm,
    location: selectedLocation,
    skill: selectedSkill,
    startDate: dateRange.start,
    endDate: dateRange.end
  };

  const [data, setData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchReport = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k,v]) => { if (v) params.append(k, v); });
      const res = await fetch(`${API_BASE}/api/reports/${type}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Fetch error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // validate date range
    if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
      setError('Start date must be before end date');
      setData([]);
      return;
    }
    fetchReport(reportType);
  }, [reportType, searchTerm, selectedLocation, selectedSkill, dateRange.start, dateRange.end]);

  const renderReportTable = () => {
  const filteredVolunteers = data || [];
  const filteredEvents = data || [];

    switch (reportType) {
      case 'volunteer-participation':
        return (
          <div>
            <h3 className="report-type-name">Volunteer Participation Report</h3>
            <div className="table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Skills</th>
                    <th>Total Events</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map(volunteer => (
                    <tr key={volunteer.volunteer_id}>
                      <td>{volunteer.volunteer_id}</td>
                      <td>{volunteer.full_name}</td>
                      <td>{volunteer.email || ''}</td>
                      <td>{volunteer.city || ''}, {volunteer.state_code || ''}</td>
                      <td>{(volunteer.skills || []).join(', ')}</td>
                      <td>{volunteer.total_events}</td>
                      <td>{volunteer.total_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredVolunteers.length === 0 && (
              <p className="no-data-message">No volunteers found matching the selected filters.</p>
            )}
          </div>
        );

      case 'volunteer-history':
        return (
          <div>
            <h3 className="report-type-name">Detailed Volunteer History</h3>
            <div className="table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Urgency</th>
                    <th>Hours</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map(item => (
                    <tr key={`${item.volunteer_id}-${item.event_id || Math.random()}`}>
                      <td>{item.full_name}</td>
                      <td>{item.event_name || ''}</td>
                      <td>{item.event_date || ''}</td>
                      <td>{item.location || ''}</td>
                      <td>{item.urgency || ''}</td>
                      <td>{item.hours_worked || ''}</td>
                      <td>{item.notes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredVolunteers.flatMap(v => v.events).length === 0 && (
              <p className="no-data-message">No volunteer history found matching the selected filters.</p>
            )}
          </div>
        );

      case 'event-management':
        return (
          <div>
            <h3 className="report-type-name">Event Management Report</h3>
            <div className="table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Urgency</th>
                    <th>Volunteers</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => (
                    <tr key={event.event_id}>
                      <td>{event.event_id}</td>
                      <td>{event.event_name}</td>
                      <td>{event.description}</td>
                      <td>{event.location}</td>
                      <td>{event.event_date}</td>
                      <td>{event.urgency || ''}</td>
                      <td>{event.total_volunteers}</td>
                      <td>{event.total_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEvents.length === 0 && (
              <p className="no-data-message">No events found matching the selected filters.</p>
            )}
          </div>
        );

      case 'event-volunteers':
        return (
          <div>
            <h3 className="report-type-name">Event Volunteer Assignments</h3>
            <div className="table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Volunteer</th>
                    <th>Skills</th>
                    <th>Hours Worked</th>
                    <th>Signup Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.flatMap(event => (event.volunteers_assigned || []).map(volunteer => (
                    <tr key={`${event.event_id}-${volunteer.volunteer_id}`}>
                      <td>{event.event_name}</td>
                      <td>{volunteer.full_name}</td>
                      <td>{(volunteer.skills || []).join(', ')}</td>
                      <td>{volunteer.hours_worked}</td>
                      <td>{volunteer.signup_date}</td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
            {filteredEvents.flatMap(e => e.volunteers_assigned).length === 0 && (
              <p className="no-data-message">No volunteer assignments found matching the selected filters.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const exportToCSV = () => {
    setLoading(true);
    
    const { csvContent, filename } = reportingService.exportToCSV(reportType, filters);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    setTimeout(() => setLoading(false), 500);
  };

  const exportToPDF = () => {
    setLoading(true);
    
    const printWindow = window.open('', '_blank');
    const reportTitle = '📊 Reporting Dashboard';
    const reportData = reportRef.current.innerHTML;
    
    const pdfContent = reportingService.generatePDFContent(reportTitle, reportData, reportType);
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
        setLoading(false);
      }, 500);
    }, 1000);
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedLocation('all');
    setSelectedSkill('all');
    setSearchTerm('');
  };

  return (
    <div className="reporting-container">
      <div className="reporting-wrapper">
        <h1 className="reporting-title">
          📊 Reporting Dashboard
        </h1>
        
        <p className="reporting-subtitle">
          Generate comprehensive reports on volunteer activities and event management
        </p>

        <div className="reporting-card">
          <h3 className="reporting-section-title">
            <FileText size={24} />
            Select Report Type
          </h3>
          
          <div className="report-type-grid">
            {reportTypes.map(report => (
              <div
                key={report.id}
                onClick={() => setReportType(report.id)}
                className={`report-type-card ${reportType === report.id ? 'active' : ''}`}
              >
                <div className="report-type-icon">{report.icon}</div>
                <h4 className="report-type-name">{report.title}</h4>
                <p className="report-type-desc">{report.desc}</p>
              </div>
            ))}
          </div>

          <div className="filters-section">
            <h4 className="filters-title">
              <Filter size={20} />
              Filters & Search
            </h4>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label>
                  <Search size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="filter-input"
                >
                  {reportingService.locations.map(loc => (
                    <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="filter-input"
                >
                  {reportingService.skills.map(skill => (
                    <option key={skill} value={skill}>{skill === 'all' ? 'All Skills' : skill}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Report Data Table */}
          <div ref={reportRef} className="report-table-container">
            {renderReportTable()}
          </div>

          <div className="export-actions">
            <button
              onClick={exportToCSV}
              disabled={loading}
              className="export-btn export-csv"
            >
              <Download size={20} />
              {loading ? 'Generating...' : 'Export to CSV'}
            </button>

            <button
              onClick={exportToPDF}
              disabled={loading}
              className="export-btn export-pdf"
            >
              <FileText size={20} />
              {loading ? 'Generating...' : 'Export to PDF'}
            </button>
          </div>
        </div>

        <div className="help-section">
          <h4 className="help-title">💡 How to Use</h4>
          <ul className="help-list">
            <li><strong>Select a report type</strong> to view different aspects of volunteer activities</li>
            <li><strong>Use filters</strong> to narrow down results by date range, location, skills, or search terms</li>
            <li><strong>Preview the data</strong> in the table below before exporting</li>
            <li><strong>Export to CSV</strong> for data analysis in Excel or Google Sheets</li>
            <li><strong>Export to PDF</strong> for professional reports and presentations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportingModule;
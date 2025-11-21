import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, Filter, Search } from 'lucide-react';
import './reportingModule.css';
import API_BASE from '../../lib/apiBase';
import Layout from '../../components/layout.jsx';

const ReportingModule = ({ isLoggedIn, user }) => {
  const [reportType, setReportType] = useState('volunteer-participation');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  const reportTypes = [
    { id: 'volunteer-participation', icon: '👥', title: 'Volunteer Participation History', desc: 'History of each volunteer\'s event participation' },
   // { id: 'volunteer-history', icon: '📋', title: 'Detailed Volunteer History', desc: 'History of each volunteer\'s event participation' },
    { id: 'event-management', icon: '📅', title: 'Event Management', desc: 'Overview of all events and their details' },
    { id: 'event-volunteers', icon: '🤝', title: 'Event Volunteer Assignments', desc: 'Detailed list of volunteer assignments per event' }
  ];

  // Fetchable lists
  const [locations, setLocations] = useState(['all']);
  const [skills, setSkills] = useState(['all']);

  /*

  const filters = {
    search: searchTerm,
    location: selectedLocation,

   

    skill: null,
    skillId: selectedSkill !== 'all' && selectedSkill?.skill_id ? selectedSkill.skill_id : null,

    startDate: dateRange.start,
    endDate: dateRange.end
  };

  */

  const filters = {
  volunteer: searchTerm,
  event: searchTerm,
  date: dateRange.start,
};


  const [data, setData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchReport = async (type) => {
    setLoading(true);
    setError(null);
    setData([]);      //trying to fix reporting issue
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k,v]) => { if (v !== null && v !== undefined && v !== '') params.append(k, v); });
      const headers = {};
      if (user && user.userType) headers['x-user-type'] = user.userType;
      const res = await fetch(`${API_BASE}/api/reports/${type}?${params.toString()}`, { headers });
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

  // load skills from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reports/skills`);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        const list = [{ skill_id: 'all', skill_name: 'All Skills' }, ...json];
        setSkills(list);
      } catch (err) {
        // leave default
      }
    })();
    return () => { mounted = false; };
  }, []);

  const renderReportTable = () => {
    /*
  const filteredVolunteers = data || [];
  const filteredEvents = data || [];
  */
    let filteredVolunteers = [];
    let filteredEvents = [];

    if (reportType === 'volunteer-participation') {
    filteredVolunteers = data || [];
    }


    if (reportType === 'event-management' || reportType === 'event-volunteers') {
      filteredEvents = data || [];
    }

    switch (reportType) {
      case 'volunteer-participation':
        return (
          <div>
            <h3 className="report-type-name">Volunteer Participation Report</h3>
            <div className="table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Volunteer ID</th>
                    <th>Volunteer Name</th>
                    <th>Volunteer Email</th>
                    <th>Volunteer's Location</th>
                    <th>Volunteer's Skills</th>
                    <th>Event's Worked</th>
                    <th>Total Events worked</th>
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
                      <td>{(volunteer.events_worked || []).join(', ')}</td>
                      <td>{volunteer.total_events}</td>
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
                    <th>Event Description</th>
                    <th>Event Location</th>
                    <th>Event Date</th>
                    <th>Urgency</th>
                    <th>Volunteers</th>
                    <th>Event Skills</th>
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
                      <td>{Array.isArray(event.volunteers) ? event.volunteers.join(', ') : event.volunteers}</td>
                      <td>{(event.required_skills || []).join(', ')}</td>
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
                      <th>Event Name</th>
                      <th>Event ID</th>
                      <th>Event Location</th>
                      <th>Volunteer Name</th>
                      <th>Volunteer ID</th>
                      <th>Volunteer Email</th>
                      <th>Volunteer's City</th>
                      <th>Volunteer Skills</th>
                      <th>Signup Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data || []).map(row => (
                      <tr key={`${row.event_id || ''}-${row.volunteer_id || ''}-${row.signup_date || ''}`}>
                        <td>{row.event_name}</td>
                        <td>{row.event_id}</td>
                        <td>{row.event_location}</td>
                        <td>{row.full_name}</td>
                        <td>{row.volunteer_id}</td>
                        <td>{row.email}</td>
                        <td>{row.volunteer_city}</td>
                        <td>{(row.skills || []).join(', ')}</td>
                        <td>{row.signup_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {((data || []).length === 0) && (
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
    try {
      let csvContent = '';
      let filename = '';
        if (reportType === 'volunteer-participation') {
        csvContent = 'Volunteer ID,Full Name,Email,City,State,Skills,Events Worked,Total Events\n';
        (data || []).forEach(v => {
          csvContent += `${v.volunteer_id || ''},"${v.full_name || ''}","${v.email || ''}","${v.city || ''}","${v.state_code || ''}","${(v.skills||[]).join('; ')}","${(v.events_worked||[]).join('; ')}",${v.total_events || 0}\n`;
        });
        filename = `volunteer_participation_${new Date().toISOString().slice(0,10)}.csv`;
      }else if (reportType === 'event-management') {
        csvContent = 'Event ID,Event Name,Description,Location,Date,Urgency,Total Volunteers,Required Skills,Volunteers\n';
        (data || []).forEach(e => {
          csvContent += `${e.event_id || ''},"${e.event_name || ''}","${e.description || ''}","${e.location || ''}","${e.event_date || ''}","${e.urgency || ''}",${e.total_volunteers || 0},"${(e.required_skills||[]).join('; ')}","${(Array.isArray(e.volunteers)?e.volunteers.join('; '):e.volunteers) || ''}"\n`;
        });
        filename = `event_management_${new Date().toISOString().slice(0,10)}.csv`;
      } else if (reportType === 'event-volunteers') {
        csvContent = 'Event ID,Event Name,Event Location,Volunteer ID,Volunteer Name,Volunteer Email,Volunteer City,Volunteer Skills,Signup Date\n';
        (data || []).forEach(r => {
          csvContent += `${r.event_id || ''},"${r.event_name || ''}","${r.event_location || ''}",${r.volunteer_id || ''},"${r.full_name || ''}","${r.email || ''}","${r.volunteer_city || ''}","${(r.skills||[]).join('; ')}","${r.signup_date || ''}"\n`;
        });
        filename = `event_volunteers_${new Date().toISOString().slice(0,10)}.csv`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (err) {
      console.error('CSV export error', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    setLoading(true);
    try {
      const printWindow = window.open('', '_blank');
      const title = '📊 Reporting Dashboard';
      const content = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}</style>
          </head>
          <body>
            <h1>${title}</h1>
            <div>${reportRef.current ? reportRef.current.innerHTML : ''}</div>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); printWindow.close(); setLoading(false); }, 500);
    } catch (err) {
      console.error('PDF export error', err);
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedLocation('all');
    setSelectedSkill('all');
    setSearchTerm('');
  };

  return (
    <Layout currentPage="reports" user={user} isLoggedIn={isLoggedIn}>
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
                        {locations.map(loc => (
                        <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
                        ))}
                    </select>
                </div>

{/*      
                <div className="filter-group">
                    <label>Skill</label>
                    <select
                      value={selectedSkill && (selectedSkill.skill_id || selectedSkill)}
                      onChange={(e) => {
                        const id = e.target.value;
                        const found = skills.find(s => String(s.skill_id) === String(id));
                        setSelectedSkill(found || id);
                      }}
                      className="filter-input"
                    >
                      {skills.map(skill => (
                        <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>
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
            */}
              <div className="filter-group">
                    <label>Skill</label>
                    <select
                      value={selectedSkill === 'all' ? 'all' : selectedSkill?.skill_id}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id === 'all') {
                          setSelectedSkill('all');
                        } else {
                          const found = skills.find(s => String(s.skill_id) === id);
                          setSelectedSkill(found);
                        }
                      }}
                      className="filter-input"
                    >
                      <option value="all">All Skills</option>
                      {skills.map(skill => (
                        <option key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</option>
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
    </Layout>
  );
};

export default ReportingModule;
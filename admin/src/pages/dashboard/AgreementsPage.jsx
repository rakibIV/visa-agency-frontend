import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  DocumentCheckIcon, 
  MagnifyingGlassIcon,
  DocumentIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import AgreementTemplatesConfig from './AgreementTemplatesConfig';

export default function AgreementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'ledger';
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch applicants for agreements. We can use a larger page size or search.
  const { data: applicants, isLoading } = useQuery({
    queryKey: ['agreements-applicants', searchTerm],
    queryFn: () => api.get('/applicants/', { params: { search: searchTerm } }).then(r => r.data.results ?? r.data),
  });

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <DocumentCheckIcon className="w-7 h-7 text-emerald-500" />
            Agreements & Documents
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, print, and track all applicant agreements and templates.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSearchParams({ tab: 'ledger' })}
            className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              currentTab === 'ledger' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <DocumentIcon className="w-4 h-4" /> Issued Agreements
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'templates' })}
            className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              currentTab === 'templates' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CogIcon className="w-4 h-4" /> Templates Config
          </button>
        </div>
      </div>

      {currentTab === 'templates' ? (
        <AgreementTemplatesConfig />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Applicant Name, Passport, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Visa / Job</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Agreement Status</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-400">Loading records...</td>
                </tr>
              ) : applicants?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center">
                    <DocumentIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No records found</p>
                    <p className="text-sm text-slate-400 mt-1">Search for an applicant to view their agreements.</p>
                  </td>
                </tr>
              ) : (
                applicants?.map((app) => {
                  // We assume app.agreement exists if an agreement is generated
                  const hasAgreement = !!app.agreement;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {app.photo ? (
                            <img src={app.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                              {app.full_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-800">{app.full_name}</p>
                            <p className="text-xs text-slate-500">{app.application_id} • {app.passport_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700 font-medium">{app.visa_name || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        {hasAgreement ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                            Pending Payment
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/applicants/${app.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm"
                        >
                          View & Print
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

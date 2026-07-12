import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, PencilSquareIcon, BriefcaseIcon, CurrencyEuroIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function JobDetailPage() {
  const { visaId, jobId } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['visa-job', visaId, jobId],
    queryFn: () => api.get(`/visas/${visaId}/jobs/${jobId}/`).then(r => r.data),
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading...</div>;
  if (error || !job) return <div className="p-20 text-center text-red-500">Failed to load job details.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/config/jobs')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            {job.title}
          </h2>
        </div>
        <Link to={`/config/visas/${visaId}/jobs/${jobId}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
          <PencilSquareIcon className="w-4 h-4" /> Edit Job
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-b border-slate-100 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Salary Range</p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              {job.minimum_salary && job.maximum_salary 
                ? `${job.minimum_salary} - ${job.maximum_salary} ${job.currency}`
                : job.minimum_salary 
                  ? `${job.minimum_salary} ${job.currency}`
                  : job.maximum_salary
                    ? `Up to ${job.maximum_salary} ${job.currency}`
                    : 'Not Specified'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Vacancies</p>
            <p className="text-sm font-semibold text-slate-800">{job.vacancies || 'Open'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Location</p>
            <p className="text-sm font-semibold text-slate-800">{job.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duty Time</p>
            <p className="text-sm font-semibold text-slate-800">
              {job.duty_hours_per_day ? `${job.duty_hours_per_day}hrs/day` : 'N/A'}
              {job.duty_days_per_week ? `, ${job.duty_days_per_week}days/week` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Requirements</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Experience:</span>
                <span>{job.experience_required || 'Not Specified'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Language:</span>
                <span>{job.language_requirement || 'Not Specified'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Education:</span>
                <span>{job.education_requirement || 'Not Specified'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Age:</span>
                <span>{job.age_requirement || 'Not Specified'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Gender:</span>
                <span>{job.gender_preference || 'Any'}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Other Details</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Contract Duration:</span>
                <span>{job.contract_duration_months ? `${job.contract_duration_months} Months` : 'Not Specified'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Overtime:</span>
                <span>{job.overtime_available ? `Yes (${job.overtime_rate || 'Standard Rate'})` : 'No'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-500">Display Order:</span>
                <span>{job.display_order}</span>
              </li>
            </ul>
          </div>
        </div>

        {job.description && (
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">Full Description</p>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{job.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}

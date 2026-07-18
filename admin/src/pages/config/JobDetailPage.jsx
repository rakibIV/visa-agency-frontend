import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  BriefcaseIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  AcademicCapIcon,
  LanguageIcon,
  SparklesIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';

export default function JobDetailPage() {
  const { visaId, jobId } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['visa-job', visaId, jobId],
    queryFn: () => api.get(`/visas/${visaId}/jobs/${jobId}/`).then(r => r.data),
  });

  const deleteJobMutation = useMutation({
    mutationFn: () => api.delete(`/visas/${visaId}/jobs/${jobId}/`),
    onSuccess: () => navigate(`/config/visas/${visaId}`),
    onError: (err) => alert('Failed to delete job: ' + (err.response?.data?.detail || err.message))
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium">Loading Job Details...</p>
    </div>
  );
  
  if (error || !job) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
      <p className="font-bold text-lg">Failed to load job details.</p>
    </div>
  );

  const InfoCard = ({ icon: Icon, label, value, bg = "bg-blue-50", text = "text-blue-600" }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${bg} ${text} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate('/config/jobs')} 
            className="mt-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                Job Profile
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${job.vacancies ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {job.vacancies ? `${job.vacancies} Openings` : 'No Openings'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {job.title}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to={`/config/visas/${visaId}/jobs/${jobId}/edit`} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-900/20"
          >
            <PencilSquareIcon className="w-5 h-5" /> Edit
          </Link>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this job?')) deleteJobMutation.mutate();
            }}
            disabled={deleteJobMutation.isPending}
            className="flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            title="Delete Job"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard 
          icon={CurrencyDollarIcon}
          label="Salary Package"
          value={job.minimum_salary && job.maximum_salary 
            ? `${job.minimum_salary} - ${job.maximum_salary} ${job.currency}`
            : job.minimum_salary ? `${job.minimum_salary} ${job.currency}`
            : job.maximum_salary ? `Up to ${job.maximum_salary} ${job.currency}`
            : 'Not Specified'}
          bg="bg-emerald-50" text="text-emerald-600"
        />
        <InfoCard 
          icon={MapPinIcon}
          label="Location"
          value={job.location || 'Not Specified'}
          bg="bg-violet-50" text="text-violet-600"
        />
        <InfoCard 
          icon={ClockIcon}
          label="Duty Hours"
          value={
            (job.duty_hours_per_day ? `${job.duty_hours_per_day}h/day ` : '') + 
            (job.duty_days_per_week ? `• ${job.duty_days_per_week}d/week` : '') || 'Not Specified'
          }
          bg="bg-orange-50" text="text-orange-600"
        />
        <InfoCard 
          icon={CalendarDaysIcon}
          label="Contract"
          value={job.contract_duration_months ? `${job.contract_duration_months} Months` : 'Not Specified'}
          bg="bg-sky-50" text="text-sky-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {job.description && (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <DocumentTextIcon className="w-32 h-32 text-blue-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5" />
                </span>
                Job Description
              </h3>
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed relative z-10">
                {job.description}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5" />
              </span>
              Benefits & Overtime
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overtime Status</p>
                <p className="font-semibold text-slate-800">
                  {job.overtime_available ? 'Available' : 'Not Available'}
                </p>
              </div>
              {job.overtime_available && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overtime Rate</p>
                  <p className="font-semibold text-slate-800">
                    {job.overtime_rate || 'Standard Rate'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Requirements */}
        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-lg font-bold flex items-center gap-2 mb-8 relative z-10">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-blue-400" />
              </span>
              Requirements
            </h3>
            
            <ul className="space-y-6 relative z-10">
              <li className="flex flex-col gap-1 border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4" /> Experience
                </span>
                <span className="font-medium">{job.experience_required || 'Any Experience Level'}</span>
              </li>
              <li className="flex flex-col gap-1 border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <LanguageIcon className="w-4 h-4" /> Language
                </span>
                <span className="font-medium">{job.language_requirement || 'No specific requirement'}</span>
              </li>
              <li className="flex flex-col gap-1 border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4" /> Education
                </span>
                <span className="font-medium">{job.education_requirement || 'Not Specified'}</span>
              </li>
              <li className="flex flex-col gap-1 border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4" /> Age Range
                </span>
                <span className="font-medium">{job.age_requirement || 'Any Age'}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender Preference</span>
                <span className="font-medium">{job.gender_preference || 'Any'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

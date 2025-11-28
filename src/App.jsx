import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Menu, X, Award, Plus, BrainCircuit, Filter } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

// CONSTANTS
const SKILL_LABELS = ['React', 'Python', 'SQL', 'Design', 'Data'];

// --- COMPONENTS ---
const SkillRadar = ({ projectSkills, employeeSkills }) => {
  const data = SKILL_LABELS.map(skill => ({
    subject: skill,
    Required: projectSkills?.[skill] || 0,
    Candidate: employeeSkills?.[skill] || 0,
    fullMark: 10,
  }));
  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar name="Required" dataKey="Required" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Radar name="Candidate" dataKey="Candidate" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. FETCH PROJECTS FROM PYTHON BACKEND
  const fetchProjects = async () => {
    try {
      const res = await fetch('https://prou-backend-fullstack.onrender.com/projects/');
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
    } catch (err) {
      console.error("Failed to connect to backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // 2. FETCH MATCHES WHEN PROJECT SELECTED
  useEffect(() => {
    if (!selectedProject) return;
    const fetchMatches = async () => {
      const res = await fetch(`https://prou-backend-fullstack.onrender.com/projects/${selectedProject.id}/matches`);
      const data = await res.json();
      setMatches(data);
      if (data.length > 0) setSelectedCandidate(data[0]);
    };
    fetchMatches();
  }, [selectedProject]);

  // 3. SEND NEW PROJECT TO BACKEND
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      required_skills: {
        React: parseInt(formData.get('react') || 0),
        Python: parseInt(formData.get('python') || 0),
        SQL: parseInt(formData.get('sql') || 0),
        Design: parseInt(formData.get('design') || 0),
        Data: parseInt(formData.get('data') || 0),
      }
    };

    await fetch('https://prou-backend-fullstack.onrender.com/projects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setIsModalOpen(false);
    fetchProjects(); // Refresh list
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Connecting to Server...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center"><BrainCircuit size={20}/></div>
          <h1 className="font-bold">SkillNexus</h1>
        </div>
        <div className="p-4"><button className="w-full bg-blue-600 py-2 rounded">Marketplace</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="text-sm text-slate-500">Connected to: Cloud</div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded text-sm"><Plus size={16} /> New Project</button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Project List */}
          <div className="w-[350px] border-r bg-white flex flex-col overflow-y-auto">
            <div className="p-4 border-b bg-slate-50 flex justify-between"><div className="flex gap-2 font-semibold text-sm"><Filter size={16}/> Projects</div><span className="bg-slate-200 px-2 rounded text-xs font-bold">{projects.length}</span></div>
            <div className="p-3 space-y-2">
              {projects.map(p => (
                <div key={p.id} onClick={() => setSelectedProject(p)} className={`p-4 rounded border cursor-pointer ${selectedProject?.id === p.id ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 bg-slate-50 overflow-y-auto p-8">
            {selectedProject && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div><h1 className="text-2xl font-bold">{selectedProject.title}</h1></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded border p-5">
                    <h3 className="font-semibold mb-4 flex gap-2"><Award size={18} className="text-amber-500"/> Candidates (from DB)</h3>
                    {matches.map(emp => (
                      <div key={emp.employee_id} onClick={() => setSelectedCandidate(emp)} className={`flex justify-between p-3 rounded border mb-2 cursor-pointer ${selectedCandidate?.employee_id === emp.employee_id ? 'bg-indigo-50 border-indigo-200' : ''}`}>
                        <div><p className="text-sm font-medium">{emp.name}</p><p className="text-[10px] text-slate-500">{emp.role}</p></div>
                        <div className="font-bold text-sm">{emp.match_score}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded border p-5 flex flex-col">
                    <h3 className="font-semibold mb-6">Skill Analysis</h3>
                    <div className="flex-1"><SkillRadar projectSkills={selectedProject.required_skills} employeeSkills={selectedCandidate?.skills} /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-lg p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold">New Project</h3><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input name="title" required placeholder="Title" className="w-full border p-2 rounded" />
              <textarea name="description" required placeholder="Description" rows="3" className="w-full border p-2 rounded"></textarea>
              <div className="grid grid-cols-2 gap-4">{SKILL_LABELS.map(s => <label key={s} className="flex justify-between text-sm">{s} <input name={s.toLowerCase()} type="number" defaultValue={5} max={10} className="w-12 border rounded text-center"/></label>)}</div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Save to Database</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

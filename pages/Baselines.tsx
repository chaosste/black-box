import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Baseline } from '../types';
import { Save, History, Activity, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InputRange } from '../components/ui/InputRange';

export const Baselines: React.FC = () => {
  const { activeProfile, addBaseline, darkMode } = useStore();
  const baselines = activeProfile?.baselines || [];

  const [form, setForm] = useState<Omit<Baseline, 'timestamp'>>({
    mood: 5,
    stress: 5,
    wellBeing: 5,
    mindfulness: 5,
    selfEsteem: 5
  });

  const handleSave = () => {
    addBaseline({ ...form, timestamp: new Date().toISOString() });
    alert('DataPoint entry captured. Neural agent state synchronized.');
  };

  const chartData = baselines.map(b => ({
    date: new Date(b.timestamp).toLocaleDateString(),
    ...b
  }));

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-2">DataPoint Entry</h2>
        <p className="opacity-60 text-lg">Calibrate the neural agent before and after flight sessions to capture precise state transitions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Entry Form */}
        <section className={`lg:col-span-1 p-8 rounded-[3rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-xl'}`}>
          <div className="flex items-center gap-2 mb-8">
            <Activity className="text-blue-500" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Capture DataPoint</h3>
          </div>
          <div className="space-y-2">
            <InputRange label="Mood" value={form.mood} onChange={(v: number) => setForm({...form, mood: v})} />
            <InputRange label="Stress" value={form.stress} onChange={(v: number) => setForm({...form, stress: v})} />
            <InputRange label="Well-Being" value={form.wellBeing} onChange={(v: number) => setForm({...form, wellBeing: v})} />
            <InputRange label="Mindfulness" value={form.mindfulness} onChange={(v: number) => setForm({...form, mindfulness: v})} />
            <InputRange label="Self-Esteem" value={form.selfEsteem} onChange={(v: number) => setForm({...form, selfEsteem: v})} />
          </div>
          <button 
            onClick={handleSave}
            className="w-full py-5 mt-6 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Save size={20} /> Record Entry
          </button>
        </section>

        {/* Visualization & Log */}
        <section className={`lg:col-span-2 space-y-8`}>
          <div className={`p-8 rounded-[3rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="text-green-500" />
              <h3 className="text-xl font-bold uppercase tracking-tight">State Trajectory</h3>
            </div>
            <div className="h-[300px]">
              {baselines.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="date" stroke={darkMode ? '#444' : '#ccc'} fontSize={10} />
                    <YAxis domain={[0, 10]} stroke={darkMode ? '#444' : '#ccc'} fontSize={10} />
                    <Tooltip contentStyle={darkMode ? { backgroundColor: '#18181b', borderColor: '#3f3f46' } : {}} />
                    <Legend />
                    <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Mood" />
                    <Line type="monotone" dataKey="wellBeing" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Well-Being" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                   <p className="font-bold">Capture more DataPoints to see trending.</p>
                </div>
              )}
            </div>
          </div>

          <div className={`p-8 rounded-[3rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2"><History size={16}/> Calibration Log</h3>
            <div className="space-y-3">
               {baselines.slice(-5).reverse().map((b, i) => (
                 <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                       <Clock size={14} className="opacity-20" />
                       <span className="text-[10px] font-mono font-bold opacity-60">{new Date(b.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-4 font-mono text-xs font-black">
                       <span className="text-blue-500">M:{b.mood}</span>
                       <span className="text-green-500">W:{b.wellBeing}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

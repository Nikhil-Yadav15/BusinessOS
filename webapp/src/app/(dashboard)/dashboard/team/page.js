'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useBusinessContext } from '../../../../components/providers/BusinessProvider.js';
import { Shield, Plus, Copy, Mail, ShieldAlert, CheckCircle2, UserPlus, X } from 'lucide-react';

const fetcher = (url, token, businessId) => fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-business-id': businessId
  }
}).then(res => res.json());

export default function TeamManagementPage() {
  const { session } = useBusinessContext();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  
  // Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Team Members
  const { data: membersRes, mutate: reloadMembers } = useSWR(
    session?.token ? ['/api/team/members', session.token, session.businessId] : null,
    ([url, t, b]) => fetcher(url, t, b)
  );
  
  // Fetch Available Roles
  const { data: rolesRes } = useSWR(
    session?.token ? ['/api/team/roles', session.token, session.businessId] : null,
    ([url, t, b]) => fetcher(url, t, b)
  );

  const team = membersRes?.members || [];
  const rolesList = rolesRes?.data || [];

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'x-business-id': session.businessId
        },
        body: JSON.stringify({ email: inviteEmail, roleId: inviteRoleId })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to invite team member');

      setSuccessMsg('Team member invited successfully!');
      setInviteEmail('');
      setInviteRoleId('');
      reloadMembers();
      
      setTimeout(() => {
        setInviteModalOpen(false);
        setSuccessMsg('');
      }, 2000);
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight font-serif">Staff</h1>
           <p className="text-slate-500 text-sm mt-1">Manage staff accounts and security permissions.</p>
         </div>
         
         <button
           onClick={() => setInviteModalOpen(true)}
           className="inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2 rounded-lg font-medium text-sm shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] transition-all h-10"
         >
           <UserPlus size={16} /> Invite Member
         </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
        
        {/* Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
           <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
             <Shield size={18} />
           </div>
           <div>
             <h3 className="font-semibold text-slate-800 text-sm">Role-Based Access Control Active</h3>
             <p className="text-xs text-slate-500">Only structural Owners and Managers can invite new members.</p>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">USER</th>
                <th className="px-6 py-4">CONTACT</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">JOINED</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                         {member.fullName?.substring(0, 2) || 'UK'}
                       </div>
                       <div>
                         <p className="font-semibold text-slate-900">{member.fullName || 'Unknown User'}</p>
                         <p className="text-xs text-slate-500">ID: {member.id.substring(0,6)}...</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail size={14} className="text-slate-400" /> {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {member.status === 'ACTIVE' ? (
                       <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                         ACTIVE
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide">
                         PENDING
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-[#B5995D] font-medium text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                       Manage Role
                     </button>
                  </td>
                </tr>
              ))}
              
              {team.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                     No team members found. Invite some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Overlay */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
               <h3 className="font-bold text-slate-900 font-serif">Invite Colleague</h3>
               <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-5">
               {errorMsg && (
                 <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                 </div>
               )}
               {successMsg && (
                 <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <span>{successMsg}</span>
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                 <input 
                   type="email" 
                   required
                   value={inviteEmail}
                   onChange={e => setInviteEmail(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5995D] focus:border-[#B5995D] sm:text-sm transition-all"
                   placeholder="colleague@business.com"
                 />
                 <p className="text-[11px] text-slate-500 mt-1.5">Ensure this user has registered an Atlas account first.</p>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Role</label>
                 <select 
                   required
                   value={inviteRoleId}
                   onChange={e => setInviteRoleId(e.target.value)}
                   className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5995D] focus:border-[#B5995D] sm:text-sm transition-all"
                 >
                   <option value="" disabled>Select a role...</option>
                   {rolesList.map(r => (
                     <option key={r.id} value={r.id}>{r.name} {r.isSystem ? '(System)' : ''}</option>
                   ))}
                 </select>
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                 <button 
                   type="button"
                   onClick={() => setInviteModalOpen(false)}
                   className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isInviting || !inviteEmail || !inviteRoleId}
                   className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                 >
                    {isInviting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Send Invite'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

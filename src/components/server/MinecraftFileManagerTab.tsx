import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit,
  Save,
  X,
  ArrowLeft,
  RefreshCw,
  Download,
  FileCode,
  FileText,
  Settings,
  HardDrive,
} from 'lucide-react';
import { MinecraftServerInstance, MinecraftFileItem } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  server: MinecraftServerInstance;
}

export const MinecraftFileManagerTab: React.FC<Props> = ({ server }) => {
  const { token } = useAuth();
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<MinecraftFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // File Editor state
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New File/Folder modals
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  const fetchFiles = async (dirPath: string = currentPath) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/files?dir=${encodeURIComponent(dirPath)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setCurrentPath(dirPath);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles('');
  }, [server.id, token]);

  const handleOpenFile = async (file: MinecraftFileItem) => {
    if (file.isDirectory) {
      fetchFiles(file.path);
      return;
    }

    try {
      const res = await fetch(`/api/servers/${server.id}/files/read?file=${encodeURIComponent(file.path)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEditingFile({ path: file.path, content: data.content });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/files/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: editingFile.path,
          content: editingFile.content,
        }),
      });
      if (res.ok) {
        setEditingFile(null);
        fetchFiles(currentPath);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!confirm(`Are you sure you want to delete ${path}?`)) return;
    try {
      const res = await fetch(`/api/servers/${server.id}/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchFiles(currentPath);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    const fullPath = currentPath ? `${currentPath}/${newFileName.trim()}` : newFileName.trim();
    try {
      await fetch(`/api/servers/${server.id}/files/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: fullPath,
          content: '',
        }),
      });
      setShowNewFileModal(false);
      setNewFileName('');
      fetchFiles(currentPath);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const fullPath = currentPath ? `${currentPath}/${newFolderName.trim()}` : newFolderName.trim();
    try {
      await fetch(`/api/servers/${server.id}/files/mkdir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: fullPath }),
      });
      setShowNewFolderModal(false);
      setNewFolderName('');
      fetchFiles(currentPath);
    } catch (e) {
      console.error(e);
    }
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    fetchFiles(parts.join('/'));
  };

  const formatSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) return <Folder className="w-4 h-4 text-amber-400" />;
    if (name.endsWith('.properties') || name.endsWith('.yml') || name.endsWith('.yaml') || name.endsWith('.json') || name.endsWith('.toml')) {
      return <Settings className="w-4 h-4 text-blue-400" />;
    }
    if (name.endsWith('.jar')) {
      return <HardDrive className="w-4 h-4 text-emerald-400" />;
    }
    if (name.endsWith('.log') || name.endsWith('.txt')) {
      return <FileText className="w-4 h-4 text-neutral-400" />;
    }
    return <FileCode className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="space-y-4">
      {/* File Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-4xl flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white">{editingFile.path}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveFile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save File'}
                </button>
                <button
                  onClick={() => setEditingFile(null)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-hidden">
              <textarea
                value={editingFile.content}
                onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                className="w-full h-full min-h-[400px] bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-200 focus:border-emerald-500 outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => fetchFiles('')}
            className="text-neutral-400 hover:text-white flex items-center gap-1"
          >
            /root
          </button>
          {currentPath && (
            <span className="text-emerald-400">/{currentPath}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {currentPath && (
            <button
              onClick={navigateUp}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Up
            </button>
          )}

          <button
            onClick={() => fetchFiles(currentPath)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewFileModal(true)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1 border border-neutral-700"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-400" /> New File
          </button>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1 border border-neutral-700"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> New Folder
          </button>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Filename (e.g. motd.txt, config.yml)..."
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          />
          <button
            onClick={handleCreateFile}
            className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewFileModal(false)}
            className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name (e.g. plugins, worlds)..."
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          />
          <button
            onClick={handleCreateFolder}
            className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewFolderModal(false)}
            className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      {/* File Table */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-900 text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
          <div className="col-span-7 sm:col-span-6">Name</div>
          <div className="col-span-2 text-right">Size</div>
          <div className="hidden sm:block col-span-2 text-right">Modified</div>
          <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {files.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Folder is empty.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.path}
                className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-neutral-800/40 text-xs transition-all"
              >
                <div
                  onClick={() => handleOpenFile(file)}
                  className="col-span-7 sm:col-span-6 flex items-center gap-2.5 font-mono cursor-pointer text-neutral-200 hover:text-emerald-400 truncate"
                >
                  {getFileIcon(file.name, file.isDirectory)}
                  <span className="truncate">{file.name}</span>
                </div>

                <div className="col-span-2 text-right font-mono text-neutral-400 text-[11px]">
                  {formatSize(file.size)}
                </div>

                <div className="hidden sm:block col-span-2 text-right font-mono text-neutral-500 text-[11px]">
                  {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : '-'}
                </div>

                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
                  {!file.isDirectory && (
                    <button
                      onClick={() => handleOpenFile(file)}
                      className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400"
                      title="Edit File"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteFile(file.path)}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

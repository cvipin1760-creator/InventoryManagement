import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { LayoutDashboard, Users, PackageOpen, Receipt, Settings, Box as BoxIcon } from 'lucide-react';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: '10vh',
      justifyContent: 'center',
      zIndex: 9999,
      p: 2
    }} onClick={() => setOpen(false)}>
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 600, 
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" style={{ width: '100%' }}>
          <Command.Input 
            placeholder="Type a command or search..." 
            autoFocus
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '18px',
              border: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              outline: 'none',
              backgroundColor: 'transparent',
              color: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          
          <Command.List style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            <Command.Empty style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" style={{ padding: '8px 4px', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
              <CommandItem onSelect={() => { navigate('/dashboard'); setOpen(false); }} icon={<LayoutDashboard size={18}/>} label="Go to Dashboard" />
              <CommandItem onSelect={() => { navigate('/products'); setOpen(false); }} icon={<PackageOpen size={18}/>} label="Inventory / Products" />
              <CommandItem onSelect={() => { navigate('/customers'); setOpen(false); }} icon={<Users size={18}/>} label="Customers" />
              <CommandItem onSelect={() => { navigate('/bills'); setOpen(false); }} icon={<Receipt size={18}/>} label="Sales & Bills" />
              <CommandItem onSelect={() => { navigate('/settings'); setOpen(false); }} icon={<Settings size={18}/>} label="System Settings" />
            </Command.Group>

            <Command.Group heading="Quick Actions" style={{ padding: '8px 4px', color: '#64748B', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
              <CommandItem onSelect={() => { navigate('/bills/create'); setOpen(false); }} icon={<Receipt size={18}/>} label="Create New Bill" />
              <CommandItem onSelect={() => { navigate('/products/create'); setOpen(false); }} icon={<BoxIcon size={18}/>} label="Add New Product" />
            </Command.Group>
          </Command.List>
        </Command>
      </Box>
    </Box>
  );
};

const CommandItem = ({ onSelect, icon, label }: { onSelect: () => void, icon: React.ReactNode, label: string }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        borderRadius: '8px',
        color: hovered ? '#2563EB' : 'inherit',
        backgroundColor: hovered ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
        fontSize: '14px',
        fontWeight: 500,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {label}
    </Command.Item>
  );
};

export default CommandPalette;

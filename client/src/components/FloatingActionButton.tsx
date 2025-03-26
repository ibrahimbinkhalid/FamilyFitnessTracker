import { useState } from 'react';
import { useLocation } from 'wouter';
import AddActivityDialog from './AddActivityDialog';
import AddScheduleDialog from './AddScheduleDialog';

export default function FloatingActionButton() {
  const [location] = useLocation();
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  const handleFabClick = () => {
    if (location === '/fitness' || location === '/') {
      setShowActivityDialog(true);
    } else if (location === '/schedule') {
      setShowScheduleDialog(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 z-20" style={{ maxWidth: '500px', margin: '0 auto', left: 0, right: 0 }}>
        <div className="absolute bottom-0 right-4">
          <button 
            className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
            onClick={handleFabClick}
          >
            <span className="material-icons">add</span>
          </button>
        </div>
      </div>
      
      <AddActivityDialog 
        open={showActivityDialog} 
        onOpenChange={setShowActivityDialog} 
      />
      
      <AddScheduleDialog 
        open={showScheduleDialog} 
        onOpenChange={setShowScheduleDialog} 
      />
    </>
  );
}

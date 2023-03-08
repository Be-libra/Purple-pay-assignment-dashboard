import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { CircularProgress } from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius : "10px",
  p: 4,
  display: "flex",
  flexDirection:"column",
  alignItems:"centre",
  justifyContent : "centre"
};

export default function ApprovalModal({open, approvalPending, approvalStatus, handleCloseApprovalModal}) {
  

  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{fontWeight:800}}>
            Approve Deposit Contract
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, display : "flex", alignItems:"center" }}>
            {!approvalPending && approvalStatus === 0 ?
             <Cancel fontSize='large' color='error' style={{marginRight: "15px"}}/> 
             : 
             !approvalPending && approvalStatus === 1 ? 
                <CheckCircle fontSize='large' color = "success" style={{marginRight: "15px"}}/> 
                : 
                <CircularProgress sx={{color:"#20F318", marginRight : "15px"}} /> }
           Approve Deposit contract to send money on your behalf.
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
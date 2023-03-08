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
};

export default function DepositModal({open, depositPending, depositStatus}) {
  

  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} display="flex" justifyContent={"center"} alignItems = "center" flexDirection={"column"}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{fontWeight:800}}>
            Depositing Funds
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, display : "flex", alignItems:"center" }}>
           Please Confirm the transaction
          </Typography>
          {!depositPending && depositStatus === 0 ? 
          <Cancel fontSize='large' color='error' style={{marginRight: "15px"}}/> :
            !depositPending && depositStatus === 1? 
                <CheckCircle fontSize='large' color='success' style={{marginRight: "15px"}}/>
                    :
                <CircularProgress color="success" size={60} style={{marginTop:"20px"}} />
          }
        </Box>
      </Modal>
    </div>
  );
}
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toaster = () => {
    return (
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // options: "light", "dark", "colored"
      />
      
    )
}

export default Toaster
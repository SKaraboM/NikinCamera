import React from 'react';
import ReactDOM from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { useState , useEffect} from 'react';
import Webcam from 'react-webcam';

import bmwgroup from './Images/BMW group.png';
import logo from './Images/BMW logo.png';

import axios from 'axios'; // Import axios

export default function Form() {
  // States for registration
  const [name, setName] = useState("");
  const [qnumber, setQnumber] = useState("");
  const [dateout, setDateout] = useState("");
  const [c4out, setC4out] = useState("");
  const [datein, setDatein] = useState("");
  const [c4in, setC4in] = useState("");
  const [lastRequest, setLastRequest] = useState("");
  const [clicked, setClicked] = useState(false);

  // States for image handling
  const [imageSrc, setImageSrc] = useState(null);
  const [imageMethod, setImageMethod] = useState("upload");
  // Webcam reference
  const webcamRef = React.useRef(null);
  // State to toggle webcam visibility
  const [showWebcam, setShowWebcam] = useState(false); // Return camera by default
  // States for checking the errors
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Handling form inputs and change
  const handleName = (e) => { setName(e.target.value); setSubmitted(false); };
  const handleQnumber = (e) => { setQnumber(e.target.value); setSubmitted(false); };
  const handleDateout = (e) => { setDateout(e.target.value); setSubmitted(false); };
  const handleC4out = (e) => { setC4out(e.target.value); setSubmitted(false); };
  const handleDatein = (e) => { setDatein(e.target.value); setSubmitted(false); };
  const handleC4in = (e) => { setC4in(e.target.value); setSubmitted(false); };

  // Handling image method change
  const handleImageMethodChange = (e) => {
    setImageMethod(e.target.value);
    setImageSrc(null); // Reset image when method changes
  };

  useEffect(() => {
    setClicked(false)
    axios.get('https://qdllbxs2i1.execute-api.eu-west-1.amazonaws.com/dev/Nikon-Camera-resoucre')
    .then(response => {
      console.log(response.data.projects)
      response.data.projects.sort((a, b) => a.TimeStamp?.toLowerCase() < b.TimeStamp?.toLowerCase() ? 1 : -1)
      setLastRequest(response.data.projects[0].Name + ", " +  response.data.projects[0].QNumber)
      setShowWebcam(response.data.projects[0].Mode === "request")
      
    })
    .catch(error => {
      console.log(error);
    });
  },[showWebcam])
  // Handling image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handling webcam capture
  const capture = () => {
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);
  };

  //Handling the form submission
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Validation based on the mode (Request or Return)
  //   if (showWebcam) {
  //     // Return Mode: Validate name, qnumber, datein (date), c4in (c4), and image
  //     if (name === "" || qnumber === "" || datein === "" || c4in === "" || !imageSrc) {
  //       setError(true);
  //       //alert("Please fill out all fields and provide an image.");
  //     } else {
  //       setSubmitted(true);
  //       setError(false);
  //       //alert(`Thank you ${name}, Camera returned successfully!`);
  //     }
  //   } else {
  //     // Request Mode: Validate name, qnumber, dateout (date), and c4out (c4)
  //     if (name === "" || qnumber === "" || dateout === "" || c4out === "") {
  //       setError(true);
  //       //alert("Please fill out all fields.");
  //     } else {
  //       setSubmitted(true);
  //       setError(false);
  //       //alert(`Thank you ${name}, Enjoy the camera!`);
  //     }
  //   }
  // };

  // const handleSubmit=()=>{
  //   axios.post('https://lzr988cts4.execute-api.eu-west-1.amazonaws.com/dev/',
  //     {'Name': (name),
        
  //     }
  //   ).then(function(response){
  //     console.log(response)
  //   }).catch(function(error){
  //     console.log(error)
  //   })
  // }

  const handleSubmit = (e) => {
    e.preventDefault();
    setClicked(true)
    let payload = {};
    if (showWebcam) {
      // Return Mode
      if (name === "" || qnumber === "" || datein === "" || c4in === "") {
        setError(true);
        return;
      }
      payload = {
        UniqueID: uuidv4(),
        Name: name,
        QNumber: qnumber,
        DateReturned: datein,
        C4PersonnelIn: c4in,
        Image: imageSrc || null, //optional image
        Mode: "return",
        TimeStamp: (new Date())

      };
    } else {
      // Request Mode
      if (name === "" || qnumber === "" || dateout === "" || c4out === "") {
        setError(true);
        return;
      }
      payload = {
        UniqueID: uuidv4(),
        Name: name,
        QNumber: qnumber,
        DateRequested: dateout,
        C4PersonnelOut: c4out,
        Mode: "request",
        TimeStamp: (new Date()),
      };
    }
  
    setError(false);
  
    axios
      .post('https://qdllbxs2i1.execute-api.eu-west-1.amazonaws.com/dev/Nikon-Camera-resoucre',
        payload)
      .then(function (response) {
        console.log("Response:", response.data);
        setSubmitted(true);
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert("There was an error submitting the form. Please try again.");
      });
  };
  

  return (
    <div className="form">
      <div className="top-images">
        <img src={bmwgroup} alt="bmwgroup" className="bmwgroup" />
        <img src={logo} alt="logo" className="logo" />
      </div>

      <div className="form-header">
        <h1>PI-64 Nikon Camera Register</h1>
      </div>

      {/* Buttons to switch between Request and Return modes
      <div className="button-container">
        <button className="btn" onClick={() => setShowWebcam(false)}>
          Request Camera
        </button>
        <button className="btn" onClick={() => setShowWebcam(true)}>
          Return Camera
        </button>
      </div> */}

      {/* Camera Status Message */}
      <div className="camera-status">
        <h3>{showWebcam ? "Returning the Camera" : "Requesting the Camera"}</h3>
        {/* <p>{showWebcam && "Last requested by " + lastRequest}</p> */}
      </div>
        

      <div className="messages">
        {error && <div className="error"><h3>Please enter all the fields</h3></div>}
        {submitted && <div className="success"><h3>Thank you {name}, {showWebcam ? "Camera returned successfully!" : "Enjoy the camera!"}</h3></div>}
      </div>

      <form>
        <div>
          <label className="label">Full Name:</label>
          <input onChange={handleName} className="input" value={name} type="text" />
        </div>

        <div>
          <label className="label">Q number:</label>
          <input onChange={handleQnumber} className="input" value={qnumber} type="text" />
        </div>

        {/* Conditionally render date fields based on the mode */}
        <div>
          <label className="label">{showWebcam ? "Date Returned:" : "Date Requested:"}</label>
          <input onChange={showWebcam ? handleDatein : handleDateout} className="input" value={showWebcam ? datein : dateout} type="date" />
        </div>

        <div>
          <label className="label">{showWebcam ? "C4 Personnel in:" : "C4 Personnel out:"}</label>
          <input onChange={showWebcam ? handleC4in : handleC4out} className="input" value={showWebcam ? c4in : c4out} type="text" />
        </div>

        {/* Conditional rendering of the image section for returning the camera */}
        {showWebcam && (
          <div className="image-section">
            <h3>Camera Status: Upload or Capture Image</h3>
            <div className="radio-group">
              <label>
                <input type="radio" value="upload" checked={imageMethod === "upload"} onChange={handleImageMethodChange} />
                Upload Image
              </label>
              <label>
                <input type="radio" value="webcam" checked={imageMethod === "webcam"} onChange={handleImageMethodChange} />
                Use Webcam
              </label>
            </div>

            {imageMethod === "upload" ? (
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
            ) : (
              <div>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={350} />
                <button type="button" onClick={capture} className="btn">Capture Photo</button>
              </div>
            )}

            {imageSrc && (
              <div className="preview">
                <h3>Image Preview:</h3>
                <img src={imageSrc} alt="Preview" style={{ width: '350px', height: 'auto' }} />
              </div>
            )}
          </div>
        )}

        <div className="button-container">
          {clicked? <button className="btn" style={{curser: 'wait'}} type="submit">Submit</button>:<button onClick={handleSubmit} className="btn" type="submit">Submit</button>}
        </div>
      </form>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Form />
  </React.StrictMode>
);

reportWebVitals();

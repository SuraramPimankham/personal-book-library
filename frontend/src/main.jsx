// จุดเข้าของ React — เอา <App /> ไปแปะลงใน <div id="root"> ของ index.html

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  // StrictMode ช่วยเตือนปัญหาตอนพัฒนา (ในโหมด dev อาจรัน effect บางอย่าง 2 รอบ)
  <StrictMode>
    <App />
  </StrictMode>
);

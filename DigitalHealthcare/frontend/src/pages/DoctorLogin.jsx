import { useNavigate } from "react-router-dom";

const DoctorLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="create-user-container">

      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      <h1>Doctor Login</h1>

      <form>
        <input type="text" placeholder="Username" /><br /><br />
        <input type="password" placeholder="Password" /><br /><br />
        <button type="submit">Login</button>
      </form>

    </div>
  );
};

export default DoctorLogin;
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();

  return (
    <div className="create-user-container">

      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      <h1>Create User</h1>

      <form>
        <input type="text" placeholder="Username" /><br /><br />
        <input type="password" placeholder="Password" /><br /><br />
        <button type="submit">Create Account</button>
      </form>

    </div>
  );
};

export default CreateUser;
import { Link } from "react-router-dom";
import fsbm from "./../shared/fsbm.jpeg";
import smi from "./../shared/smi.jpeg";
import emploiicon from "./../shared/consulterIcon.webp";
import user from "./../shared/user.webp";
const Home = () => {
  return (
    <div className="p-3">
      <div>
        <ul className="d-flex justify-content-between ">
          <li>
            <img src={fsbm} alt="fsbm" width="200px" />
          </li>
          <li>
            <img src={smi} alt="smi" width="200px" />
          </li>
        </ul>
      </div>
      <h4 className="text-center">Bienvenue sur le FSBM Planificateur </h4>

      <div className="prancipal-link">
        <ul className="d-flex justify-content-around mt-3 ">
          <li>
            <Link to="/consulter">
              <p>
                consulter l'emploi
                <img
                  src={emploiicon}
                  alt="emploiicon"
                  width="80%"
                  height="80%"
                />
              </p>
            </Link>
          </li>
          <li>
            <Link to="/login">
              <p>login d'administrateur</p>{" "}
              <img src={user} alt="user" width="80%" height="60%" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;

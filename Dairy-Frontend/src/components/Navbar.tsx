import { Link } from "react-router-dom"

function Navbar() {
    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <span className="navbar-brand">Dairy System</span>

                <div>

                    <Link className="btn btn-light me-2" to="/dashboard">
                        Dashboard
                    </Link>

                    <Link className="btn btn-light me-2" to="/farmers">
                        Farmers
                    </Link>

                    <Link className="btn btn-light me-2" to="/milk">
                        Milk
                    </Link>

                    <Link className="btn btn-light me-2" to="/payments">
                        Payments
                    </Link>

                    <Link className="btn btn-light" to="/reports">
                        Reports
                    </Link>

                </div>

            </div>

        </nav>

    )
}

export default Navbar
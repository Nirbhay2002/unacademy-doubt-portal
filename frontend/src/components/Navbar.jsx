import React from 'react';

const Navbar = ({ view, setView }) => {
    return (
        <nav>
            <h1>DoubtPortal</h1>
            <div className="nav-links">
                <button
                    className={view === 'student' ? 'active' : ''}
                    onClick={() => setView('student')}
                >
                    Student View
                </button>
                <button
                    className={view === 'admin' ? 'active' : ''}
                    onClick={() => setView('admin')}
                >
                    Admin Dashboard
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

import React from 'react'
import NavBar from '../../components/navbar/navbar'
import './schedule.scss'

// each input: class name, time, id
const schedule = () => {

  return (
    <div>
      <NavBar active={'schedule'}></NavBar>
      <h1>My Schedule</h1>
      
      <div className="calendar">
  <div className="timeline">
    <div className="spacer"></div>
    <div className="time-marker">8 AM</div>
    <div className="time-marker">9 AM</div>
    <div className="time-marker">10 AM</div>
    <div className="time-marker">11 AM</div>
    <div className="time-marker">12 PM</div>
    <div className="time-marker">1 PM</div>
    <div className="time-marker">2 PM</div>
    <div className="time-marker">3 PM</div>
    <div className="time-marker">4 PM</div>
    <div className="time-marker">5 PM</div>
    <div className="time-marker">6 PM</div>
  </div>
  <div className="days">
    <div className="day mon">
      <div className="date">
        <p className="date-day">Mon</p>
      </div>
      <div className="events">
        <div className={`event start-${9} end-${11}`}>
          <p className="title2">MATH135</p>
          <p className="number">817347</p>
          <p className="time">9 AM - 11 AM</p>
        </div>
        <div className={`event start-${12} end-${2}`}>
          <p className="title2">ECON101</p>
          <p className="number">38492</p>
          <p className="time">12 AM - 2 PM</p>
        </div>
        <div className={`event start-${3} end-${6}`}>
          <p className="title2">CS135</p>
          <p className="number">38293</p>
          <p className="time">3 PM - 6 PM</p>
        </div>
      </div>
    </div>
    <div className="day tues">
      <div className="date">
        <p className="date-day">Tues</p>
      </div>
      <div className="events">
      <div className={`event start-${3} end-${5}`}>
          <p className="title2">MATH138</p>
          <p className="number">64283</p>
          <p className="time">3 PM - 5 PM</p>
        </div>
        <div className={`event start-${8} end-${11}`}>
          <p className="title2">BET100</p>
          <p className="number">3743743</p>
          <p className="time">8 AM - 11 AM</p>
        </div>
      </div>
    </div>
    <div className="day wed">
      <div className="date">

        <p className="date-day">Wed</p>
      </div>
      <div className="events">
      <div className={`event start-${9} end-${11}`}>
          <p className="title2">MATH135</p>
          <p className="number">817347</p>
          <p className="time">9 AM - 11 AM</p>
        </div>
        <div className={`event start-${12} end-${2}`}>
          <p className="title2">ECON101</p>
          <p className="number">38492</p>
          <p className="time">12 AM - 2 PM</p>
        </div>
        <div className={`event start-${3} end-${6}`}>
          <p className="title2">CS135</p>
          <p className="number">38293</p>
          <p className="time">3 PM - 6 PM</p>
        </div>
      </div>
    </div>
    <div className="day thurs">
      <div className="date">
        <p className="date-day">Thurs</p>
      </div>
      <div className="events">
      <div className={`event start-${3} end-${5}`}>
          <p className="title2">MATH138</p>
          <p className="number">64283</p>
          <p className="time">3 PM - 5 PM</p>
        </div>
        <div class={`event start-${8} end-${11}`}>
          <p class="title2">BET100</p>
          <p class="number">3743743</p>
          <p className="time">8 AM - 11 AM</p>
        </div>
      
      </div>
    </div>
    <div className="day fri">
      <div className="date">
        <p className="date-day">Fri</p>
      </div>
      <div className="events">
      <div className={`event start-${9} end-${11}`}>
          <p className="title2">MATH135</p>
          <p className="number">817347</p>
          <p className="time">9 AM - 11 AM</p>
        </div>
        <div className={`event start-${12} end-${2}`}>
          <p className="title2">ECON101</p>
          <p className="number">38492</p>
          <p className="time">12 AM - 2 PM</p>
        </div>
        <div className={`event start-${3} end-${6}`}>
          <p className="title2">CS135</p>
          <p className="number">38293</p>
          <p className="time">3 PM - 6 PM</p>
        </div>
      </div>
    </div>
  </div>
</div>
</div>


  )
}

export default schedule
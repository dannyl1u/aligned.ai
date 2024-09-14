import React, { useState, useEffect } from 'react'
import NavBar from '../../components/navbar/navbar'
import './Add.scss';
import { UserAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import CourseCard from '../../components/CourseCard/CourseCard';

const Add = () => {
  /**
   * Object property:
   * Class Name:
   * Class Number:
   * Days:
   * Start time:
   * End time:
   * 
   * Create a large array [];
   * On submit add object to the array;
   * Add array to database
   */
  const { user } = UserAuth();

  // varaibles
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');  
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [courses, setCourses] = useState([]); // array
  const [courseList, setCourseList] = useState([]); // array

  const createCourses = async(e) => {
    e.preventDefault();
    
    const course = {
      coursename: courseName,
      coursecode: courseCode,
      days: day,
      starttime: startTime,
      endtime: endTime,
      id: user.uid
    };
    
    console.log(course);

    // setCounter(counter + 1);
    setCourses([...courses, course]);
    //console.log(courses);

    await setDoc(doc(db, "courses", user.uid),  { courses }  , {merge: true});
    console.log('successfully send data');
  }

  const docRef = doc(db, "courses", user.uid);
  useEffect(() => {
    const getCourses = async () => {
      // gives the list of courses
      const list = await getDoc(docRef);
      console.log(list.data());
      setCourseList(list.data());
      // console.log(courseList);
    }
    getCourses();
    // console.log(courseList);
  });

  const Clear = () => {
    setCourseName('');
    setCourseCode('');
    setDay({selected: ""});
    setStartTime('');
    setEndTime('');
  }
  
  
  return (
    <div className='background'>
      <NavBar></NavBar>
      <header>Add  Your Classes</header>
      <form onSubmit={createCourses} className='add-class'>
            <div className='single-form'>
              {/* Course Name */}
              <div className='form-control'>
                <label className="label-text">Course Name</label>
                <input className='control' onChange={(e) => setCourseName(e.target.value)} type="text" name="coursename" id="coursename" required autoComplete="off" placeholder="Course Name" value={courseName}></input>
              </div>
              {/* Course Code */}
              <div className='form-control'>
                <label className="label-text">Course Code</label>
                <input className='control' onChange={(e) => setCourseCode(e.target.value)} type="number" name="coursecode" id="coursecode" required autoComplete="off" placeholder="Course Code" value={courseCode}></input>
              </div>
              {/* Day */}
              <div className='form-control'>
                <label className="label-text">Lecture Days</label>
                <select className='control' onChange={(e) => setDay(e.target.value)} required value={day}>
                  <option disabled defaultValue>Day of the week</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wedneday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>
              {/* Start time */}
              <div className='form-control'>
                <label className="label-text">Start time</label>
                <input className='control' onChange={(e) => setStartTime(e.target.value)} type="time" name="time" id="time" required autoComplete="off" value={startTime}></input>
              </div>
              {/* End time */}
              <div className='form-control'>
                <label className="label-text">End time</label>
                <input className='control' onChange={(e) => setEndTime(e.target.value)} type="time" name="time" id="time" required autoComplete="off" value={endTime}></input>
              </div>
              
              {/* Add Button */}
              <button className='control-buttons'><i className="fa-solid fa-circle-plus"></i></button>
            </div>
      </form>

      {/* Clear Form */}
      <button className="clear" onClick={Clear}>Clear</button> 

       {/* Course Cards */}
       <div className="body-ctn">
        {courseList.courses && courseList.courses.map((course) => (
          <CourseCard  name={course.coursename} code={course.coursecode} day={course.days} start={course.starttime} end={course.endtime}></CourseCard>
        ))}
       </div>
    </div>
    
  )

}

export default Add



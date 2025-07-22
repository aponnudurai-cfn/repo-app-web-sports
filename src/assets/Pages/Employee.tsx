import type { Schema } from "../../../amplify/data/resource";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";

type EmployeeWithDepartment =  {
    employeeId: string;
    firstName: string;
    lastName: string;
    department: {
        groupName: string;
    };
};


const client = generateClient<Schema>();

export default function Employee() {
    const [employees, setEmployees] = useState<EmployeeWithDepartment[]>([]);

    const fetchEmployees = async () => {
        const response = await client.models.Employee.list({
    selectionSet: [
      'employeeId',
      'firstName',
      'lastName',
      'department.groupName',
    ],
  });
        setEmployees(response.data ?? []); 
      };

    useEffect(() => {
        fetchEmployees();
    }, []);

    
    return <div>
        <h2>Employee List</h2>
        <ul>
            {employees.map((employee) => (
                <li key={employee.employeeId}>
                    {employee.firstName} {employee.lastName}
                </li>
            ))}
        </ul>
    </div>
}
  

import type { Schema } from "../../../amplify/data/resource";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";

type StaffMember = {
    staffId: string;
    firstName: string;
    lastName: string;
    branch: {
        groupName: string;
    };
};


const client = generateClient<Schema>();

export default function Staff() {
    const [allStaff, setAllStaff] = useState<StaffMember[]>([]);

    const fetchStaff = async () => {
        const response = await client.models.Staff.list({
            selectionSet: [
                'staffId',
                'firstName',
                'lastName',
                'branch.groupName',
            ],
        });
        setAllStaff(response.data ?? []);
    };

    useEffect(() => {
        fetchStaff();
    }, []);


    return <div>
        <h2>Staff List</h2>
        <ul>
            {allStaff.map((staff) => (
                <li key={staff.staffId}>
                    {staff.firstName} {staff.lastName} - {staff.branch.groupName}
                </li>
            ))}
        </ul>
    </div>
}


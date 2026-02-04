"use client"

import { Select } from 'antd';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { USER_MUTATION } from '@/lib/graphql/mutation';
import { IUser } from '@/lib/hooks/Interfaces';
import { MONTHS } from '@/lib/constants';

const { Option } = Select;

interface FiscalMonthSelectProps {
    user: IUser;
}

export function FiscalMonthSelect(props: FiscalMonthSelectProps) {
    const [loading, setLoading] = useState(false);

    const [fiscalYearMutate] = useMutation(USER_MUTATION, {
        refetchQueries: ['Me', 'Dashboard'],
        onCompleted: () => {
            setLoading(false);
        },
        onError: (error) => {
            console.error('Error updating fiscal year:', error);
            setLoading(false);
        }
    });

    function handleChangeFiscal(value: string) {
        setLoading(true);
        fiscalYearMutate({
            variables: {
                user: {
                    company: {
                        name: props.user.company.name,
                        fiscal_year: {
                            month: value
                        }
                    }
                }
            }
        });
    }

    return (
        <Select
            defaultValue={props.user.company.fiscal_year.month.toString()}
            style={{ width: '100%' }}
            onChange={handleChangeFiscal}
            loading={loading}
            disabled={loading}
        >
            {MONTHS.map((month: string, index: number) => (
                <Option
                    value={(index + 1).toString()}
                    key={`fiscal_option_${index}`}
                >
                    {month}
                </Option>
            ))}
        </Select>
    );
}

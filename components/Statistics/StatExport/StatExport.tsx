'use client';

import { IUser, IVehicle } from "@/lib/hooks/Interfaces";
import './StatExport.css';
import { Button, DatePicker, Form, Input, Select, Space, App } from "antd";
import { ME_QUERY } from "@/lib/graphql/queries";
import { useQuery } from "@apollo/client";
import { getUnixTime, getYear } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loading } from "@/components/Common/Loading";
import {
  buildDrivers,
  buildEnergies,
  buildMakes,
  buildModels,
  buildRegistrations,
  buildTypes,
  sortVehiclesByMake
} from "@/services/VehiculesService";
import ButtonModal from "@/components/Common/ButtonModal";

export interface IFromTo {
  from: number;
  to: number;
}

interface IStatExport {
  user: IUser | null;
  vehicles: IVehicle[];
}

function StatExport(props: IStatExport) {
  const { notification } = App.useApp();

  const [typeExport, setTypeExport] = useState<string>('all');
  const [email, setEmail] = useState<string>('');
  const [isAutopartage, setIsAutopartage] = useState<boolean | null>(null);

  const [selectedTypeTags, setSelectedTypeTags] = useState<string[]>([]);
  const [selectedEnergyTags, setSelectedEnergyTags] = useState<string[]>([]);
  const [selectedMakeTags, setSelectedMakeTags] = useState<string[]>([]);
  const [selectedModelTags, setSelectedModelTags] = useState<string[]>([]);
  const [selectedDriverTags, setSelectedDriverTags] = useState<string[]>([]);
  const [selectedRegistrationTags, setSelectedRegistrationTags] = useState<string[]>([]);

  const [types, setTypes] = useState<string[]>([]);
  const [energies, setEnergies] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);

  const selectedTypeTagsRef = useRef(selectedTypeTags);
  const selectedEnergyTagsRef = useRef(selectedEnergyTags);
  const selectedMakeTagsRef = useRef(selectedMakeTags);
  const selectedModelTagsRef = useRef(selectedModelTags);
  const selectedDriverTagsRef = useRef(selectedDriverTags);
  const selectedRegistrationTagsRef = useRef(selectedRegistrationTags);

  const [vehicles] = useState<IVehicle[]>(props.vehicles);

  const [period, setPeriod] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [fromTo, setFromTo] = useState<IFromTo | null>(null);
  const { RangePicker } = DatePicker;

  const { loading, error, data } = useQuery(ME_QUERY);

  // Set default email when user data is loaded
  useEffect(() => {
    if (props.user?.email && !email) {
      setEmail(props.user.email);
    }
  }, [props.user?.email]);

  const resultVehicles = useMemo(() => {
    const filtered = vehicles.filter((vehicle: IVehicle) =>
      (isAutopartage === null || (isAutopartage === vehicle.device?.carSharing) || (!isAutopartage && !vehicle.device?.carSharing)) &&
      (selectedTypeTags.length === 0 || selectedTypeTags.includes(vehicle.information.type)) &&
      (selectedEnergyTags.length === 0 || selectedEnergyTags.includes(vehicle.information.energy)) &&
      (selectedMakeTags.length === 0 || selectedMakeTags.includes(vehicle.information.make)) &&
      (selectedModelTags.length === 0 || selectedModelTags.includes(vehicle.information.model)) &&
      (selectedDriverTags.length === 0 || (vehicle.driver?.driverID && selectedDriverTags.includes(vehicle.driver?.firstName + ' ' + vehicle.driver?.lastName))) &&
      (selectedRegistrationTags.length === 0 || selectedRegistrationTags.includes(vehicle.information.registration))
    );
    return sortVehiclesByMake(filtered);
  }, [
    vehicles,
    isAutopartage,
    selectedTypeTags,
    selectedEnergyTags,
    selectedMakeTags,
    selectedModelTags,
    selectedDriverTags,
    selectedRegistrationTags,
  ]);

  useEffect(() => {
    setTypes(
      [
        ...buildTypes(vehicles),
        ...selectedTypeTagsRef.current
      ].filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
    );
    setEnergies(
      [
        ...buildEnergies(vehicles),
        ...selectedEnergyTagsRef.current
      ].filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
    );
    setMakes(
      [
        ...buildMakes(vehicles),
        ...selectedMakeTagsRef.current
      ].filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
    );
    setModels(
      [
        ...buildModels(vehicles),
        ...selectedModelTagsRef.current
      ].filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
    );
    setDrivers(
      [
        ...buildDrivers(vehicles),
        ...selectedDriverTagsRef.current
      ].filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
    );
    setRegistrations(
      [
        ...buildRegistrations(vehicles),
        ...selectedRegistrationTagsRef.current
      ].filter((element: string, index: number, array: string[]) => array.indexOf(element) === index)
    );
  }, [vehicles, isAutopartage]);

  useEffect(() => {
    const updateTags = () => {
      setTypes(buildTypes(resultVehicles));
      setEnergies(buildEnergies(resultVehicles));
      setMakes(buildMakes(resultVehicles));
      setModels(buildModels(resultVehicles));
      setDrivers(buildDrivers(resultVehicles));
      setRegistrations(buildRegistrations(resultVehicles));
    };
    updateTags();
  }, [isAutopartage]);

  useEffect(() => {
    const updateTags = () => {
      if (selectedTypeTags.length === 0) setTypes(buildTypes(resultVehicles));
      setEnergies(buildEnergies(resultVehicles));
      setMakes(buildMakes(resultVehicles));
      setModels(buildModels(resultVehicles));
      setDrivers(buildDrivers(resultVehicles));
      setRegistrations(buildRegistrations(resultVehicles));
    };
    updateTags();
  }, [selectedTypeTags]);

  useEffect(() => {
    const updateTags = () => {
      if (selectedEnergyTags.length === 0) setEnergies(buildEnergies(resultVehicles));
      setTypes(buildTypes(resultVehicles));
      setMakes(buildMakes(resultVehicles));
      setModels(buildModels(resultVehicles));
      setDrivers(buildDrivers(resultVehicles));
      setRegistrations(buildRegistrations(resultVehicles));
    };
    updateTags();
  }, [selectedEnergyTags]);

  useEffect(() => {
    const updateTags = () => {
      if (selectedMakeTags.length === 0) setMakes(buildMakes(resultVehicles));
      setTypes(buildTypes(resultVehicles));
      setEnergies(buildEnergies(resultVehicles));
      setModels(buildModels(resultVehicles));
      setDrivers(buildDrivers(resultVehicles));
      setRegistrations(buildRegistrations(resultVehicles));
    };
    updateTags();
  }, [selectedMakeTags]);

  useEffect(() => {
    const updateTags = () => {
      if (selectedModelTags.length === 0) setModels(buildModels(resultVehicles));
      setTypes(buildTypes(resultVehicles));
      setEnergies(buildEnergies(resultVehicles));
      setMakes(buildMakes(resultVehicles));
      setDrivers(buildDrivers(resultVehicles));
      setRegistrations(buildRegistrations(resultVehicles));
    };
    updateTags();
  }, [selectedModelTags]);

  useEffect(() => {
    const updateTags = () => {
      if (selectedDriverTags.length === 0) setDrivers(buildDrivers(resultVehicles));
      setTypes(buildTypes(resultVehicles));
      setEnergies(buildEnergies(resultVehicles));
      setMakes(buildMakes(resultVehicles));
      setModels(buildModels(resultVehicles));
      setRegistrations(buildRegistrations(resultVehicles));
    };
    updateTags();
  }, [selectedDriverTags]);

  useEffect(() => {
    const updateTags = () => {
      if (selectedRegistrationTags.length === 0) setRegistrations(buildRegistrations(resultVehicles));
      setTypes(buildTypes(resultVehicles));
      setEnergies(buildEnergies(resultVehicles));
      setMakes(buildMakes(resultVehicles));
      setModels(buildModels(resultVehicles));
      setDrivers(buildDrivers(resultVehicles));
    };
    updateTags();
  }, [selectedRegistrationTags]);

  if (loading) {
    return <Loading msg="Chargement..." />;
  }
  if (error) {
    return <p>Error :(</p>;
  }

  const user: IUser = data.whoami;
  const month = user.company ? user.company.fiscal_year.month - 1 : 0;

  const predefinedRanges: Record<string, [Dayjs, Dayjs]> = {
    "Aujourd'hui": [dayjs().startOf("day"), dayjs().endOf("day")],
    "Hier": [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")],
    "Les 7 derniers jours": [dayjs().subtract(7, "day"), dayjs()],
    "Les 90 derniers jours": [dayjs().subtract(90, "day"), dayjs()],
    "Les 12 derniers mois": [dayjs().subtract(12, "month"), dayjs()],
    "Année civile en cours": [dayjs().startOf("year"), dayjs().endOf("year")],
    "Année fiscale en cours": [dayjs(new Date(getYear(new Date()), month, 1)), dayjs().endOf("day")]
  };

  const setDate = (from: Dayjs, to: Dayjs) => {
    setFromTo({
      from: getUnixTime(from.toDate()),
      to: getUnixTime(to.toDate()),
    });
  };

  const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || dates[0] === null || dates[1] === null) {
      setFromTo(null);
    } else {
      const from = dates[0];
      const to = dates[1];
      setPeriod([from, to]);
      setDate(from, to);
    }
  };

  const handlePeriodChange = (value: string) => {
    if (value === undefined) {
      setFromTo(null);
      setPeriod([null, null]);
      return;
    }
    const from = predefinedRanges[value][0];
    const to = predefinedRanges[value][1];

    setPeriod([from, to]);
    setDate(from, to);
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    const parsedToken = token ? JSON.parse(token) : {};

    const exportData = {
      email: email || user.email,
      type: typeExport,
      filters: {
        from: fromTo?.from ?? 0,
        to: fromTo?.to ?? 0,
        vehicles: resultVehicles.map((vehicle: IVehicle) => vehicle.id),
        types: selectedTypeTags,
        energies: selectedEnergyTags,
        makes: selectedMakeTags,
        models: selectedModelTags,
        drivers: selectedDriverTags,
        registrations: selectedRegistrationTags
      }
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPORTER_URL}/export`, {
        method: 'POST',
        body: JSON.stringify(exportData),
        headers: {
          'Content-Type': 'application/json',
          'x-carmoove-token': parsedToken.access_token || ''
        }
      });

      if (response.ok) {
        notification.info({
          message: 'Votre demande est en cours de traitement',
          description: 'Vous recevrez un email lorsqu\'il sera prêt.',
        });
      } else {
        notification.error({
          message: 'Erreur',
          description: 'Une erreur est survenue lors de l\'export.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: 'Une erreur est survenue lors de l\'export.',
      });
    }
  };

  return (
    <div className="statistic-export-box">
      <h2>Choisissez l'export</h2>
      <Form.Item
        layout="vertical"
        label="Type d'export"
        rules={[{ required: true, message: 'Veuillez choisir un type d\'export' }]}
      >
        <Select
          options={[
            { value: 'all', label: 'Brut (données brutes horodatées)' },
            { value: 'gpx', label: 'Trajets (fichier GPX)' }
          ]}
          value={typeExport}
          onChange={(value) => setTypeExport(value)}
          style={{ maxWidth: '500px' }}
        />
      </Form.Item>

      <h2>Filtrez les données</h2>
      <div>
        <RangePicker
          allowClear={true}
          format="DD/MM/YYYY"
          onCalendarChange={handleCalendarChange}
          value={period}
        />
        <span style={{ marginLeft: '10px', marginRight: '10px' }}>ou sélection d'une période :</span>
        <span className="select-box" style={{ width: '190px', display: 'inline-block' }}>
          <Select
            allowClear
            style={{ width: '200px' }}
            variant="outlined"
            onChange={(value) => handlePeriodChange(value)}
          >
            {Object.keys(predefinedRanges).map((key) => (
              <Select.Option key={key} value={key}>
                {key}
              </Select.Option>
            ))}
          </Select>
        </span>
      </div>

      <Space className="filter-buttons" style={{ marginTop: '15px', marginBottom: '15px' }}>
        <ButtonModal
          title="Usage"
          elements={[
            { value: 'autopartage', label: 'Autopartage' },
            { value: 'individuel', label: 'Individuel' }
          ]}
          elementsChecked={isAutopartage !== null
            ? [{ value: isAutopartage ? 'autopartage' : 'individuel', label: isAutopartage ? 'Autopartage' : 'Individuel' }]
            : []
          }
          setElementChecked={(items) => {
            if (items.length === 0) {
              setIsAutopartage(null);
            } else {
              setIsAutopartage(items[items.length - 1].value === 'autopartage');
            }
          }}
          getKey={(el) => el.value}
          getLabel={(el) => el.label}
        />

        <ButtonModal
          title="Type"
          elements={types}
          elementsChecked={selectedTypeTags}
          setElementChecked={setSelectedTypeTags}
          getKey={(el) => el}
          getLabel={(el) => el}
        />

        <ButtonModal
          title="Energie"
          elements={energies}
          elementsChecked={selectedEnergyTags}
          setElementChecked={setSelectedEnergyTags}
          getKey={(el) => el}
          getLabel={(el) => el}
        />

        <ButtonModal
          title="Marque"
          elements={makes}
          elementsChecked={selectedMakeTags}
          setElementChecked={setSelectedMakeTags}
          getKey={(el) => el}
          getLabel={(el) => el}
        />

        <ButtonModal
          title="Modèle"
          elements={models}
          elementsChecked={selectedModelTags}
          setElementChecked={setSelectedModelTags}
          getKey={(el) => el}
          getLabel={(el) => el}
        />

        <ButtonModal
          title="Conducteur"
          elements={drivers}
          elementsChecked={selectedDriverTags}
          setElementChecked={setSelectedDriverTags}
          getKey={(el) => el}
          getLabel={(el) => el}
        />

        <ButtonModal
          title="Immatriculation"
          elements={registrations}
          elementsChecked={selectedRegistrationTags}
          setElementChecked={setSelectedRegistrationTags}
          getKey={(el) => el}
          getLabel={(el) => el}
        />
      </Space>

      <h2>Indiquez où recevoir le rapport</h2>
      <Form.Item
        layout="vertical"
        label="Email"
        rules={[{ required: false, type: "email" }]}
      >
        <Input
          type="email"
          className="input"
          value={email}
          placeholder={user.email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          style={{ maxWidth: '500px' }}
        />
      </Form.Item>

      <div style={{ marginTop: '20px' }}>
        <Button
          type="primary"
          className="validate-btn"
          onClick={handleExport}
          size="large"
        >
          EXPORTER
        </Button>
      </div>
    </div>
  );
}

export default StatExport;

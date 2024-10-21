"use client";
import CustomMap from "@/components/ui/map";
import React, { useEffect, useState } from "react";
import { CSVLoader } from "@loaders.gl/csv";
import { load } from "@loaders.gl/core";
const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv";

type DataPoint = [longitude: number, latitude: number];

const getData = async () => {
  const data: any = (await load(DATA_URL, CSVLoader)).data;
  const points: DataPoint[] = data.map((d: any) => [d.lng, d.lat]);

  return points;
};

export default function WareHouseTrackingPage() {
  const [data, setData] = useState<DataPoint[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getData();
      setData(result);
    };

    fetchData();
  }, []);
  return (
    <div className="size-full relative">
      <CustomMap data={data} />
    </div>
  );
}

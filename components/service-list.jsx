const { Text } = require("lucide-react");

const ServiceList = ({ services }) => {
  return (
    <div className="flex mt-2 flex-wrap gap-2">
      {services.map((service) => (
        <span
          key={service.service}
          className="border-solid border-black border-2 py-1 px-3 rounded-3xl text-xs"
        >
          {service.service}
        </span>
      ))}
    </div>
  );
};

export default ServiceList;

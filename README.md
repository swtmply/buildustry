## Updates

User Model:

```bash
    firstName and lastName fields converted to name
    added laborType // If User is laborer, user must add specific laborType
```

Contractor Model: if user role is contractor, Contractor Model will be created

```bash
    location: String,
    description: String,
    userId: String,
    servicesOffered: ServicedOffered[] // Another model for services offered. Since we used sqlite.
    Model ServiceOffered: {
        id: String,
        service: String,
        contractorId: @relation(Contractor Model)
    }
```

Note: servicesOffered must be an array of strings pass to req.body. If user will update the servicesOffered or add valud, old servicesOffered data must retrieve and pass again with the new data as an array or string to retain the value.

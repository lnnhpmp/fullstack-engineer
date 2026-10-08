-- The Salesforce org's records, as the toy Salesforce reads them on start and on reset.
-- Object and field names are Salesforce API names; Postgres folds them to lower case,
-- so salesforce.QuoteLineItem and salesforce.quotelineitem are the same table.

DROP SCHEMA IF EXISTS salesforce CASCADE;
CREATE SCHEMA salesforce;

CREATE TABLE salesforce.User (
  Id text PRIMARY KEY,
  FirstName text,
  LastName text,
  Name text,
  Email text
);

CREATE TABLE salesforce.Account (
  Id text PRIMARY KEY,
  Name text NOT NULL,
  WeMaintain_Customer_ID__c text,
  BillingCountryCode text,
  CurrencyIsoCode text,
  OwnerId text
);

CREATE TABLE salesforce.Opportunity (
  Id text PRIMARY KEY,
  Name text,
  AccountId text,
  OwnerId text
);

CREATE TABLE salesforce.Pricebook2 (
  Id text PRIMARY KEY,
  Name text NOT NULL,
  IsActive boolean NOT NULL,
  IsStandard boolean NOT NULL,
  CurrencyIsoCode text,
  Country__c text,
  Type__c text
);

CREATE TABLE salesforce.Product2 (
  Id text PRIMARY KEY,
  Name text NOT NULL,
  Description text,
  StockKeepingUnit text,
  ProductCode text,
  Family text,
  Source__c text,
  IsActive boolean NOT NULL
);

CREATE TABLE salesforce.PricebookEntry (
  Id text PRIMARY KEY,
  Pricebook2Id text NOT NULL,
  Product2Id text NOT NULL,
  ProductCode text,
  UnitPrice numeric NOT NULL,
  CurrencyIsoCode text,
  IsActive boolean NOT NULL,
  UseStandardPrice boolean NOT NULL
);

CREATE TABLE salesforce.Quote (
  Id text PRIMARY KEY,
  Name text,
  QuoteNumber text NOT NULL,
  Status text NOT NULL,
  GrandTotal numeric,
  Subtotal numeric,
  Discount numeric,
  CurrencyIsoCode text,
  CreatedDate timestamptz NOT NULL,
  SentDate__c date,
  PreAcceptedDate__c timestamptz,
  AcceptedDate__c timestamptz,
  ToBeBilledDate__c timestamptz,
  BilledDate__c timestamptz,
  ExpirationDate date,
  Description__c text,
  AccountId text,
  OpportunityId text,
  ContactId text,
  Email text,
  Pricebook2Id text,
  TVA__c numeric,
  WeMaintain_Quote_ID__c text
);

CREATE TABLE salesforce.QuoteLineItem (
  Id text PRIMARY KEY,
  QuoteId text NOT NULL,
  PricebookEntryId text,
  Product2Id text,
  Quantity numeric NOT NULL,
  UnitPrice numeric NOT NULL,
  ListPrice numeric,
  Discount numeric,
  Cost__c numeric,
  QuotePdf_ProductName__c text,
  Quote_Line_Description__c text,
  CreatedDate timestamptz NOT NULL
);

CREATE TABLE salesforce.Repair_Request__c (
  Id text PRIMARY KEY,
  Name text,
  RRID__c text,
  Quote__c text
);

CREATE TABLE salesforce.Device__c (
  Id text PRIMARY KEY,
  Name text,
  WeMaintain_ID__c text,
  Country__c text
);

CREATE TABLE salesforce.Contract (
  Id text PRIMARY KEY,
  AccountId text,
  Wemaintain_ID__c text,
  StartDate date,
  EndDate date,
  CurrencyIsoCode text
);

CREATE TABLE salesforce.ContractDeviceAssociation__c (
  Id text PRIMARY KEY,
  Contract__c text,
  Device__c text,
  Amount__c numeric,
  StartDate__c date,
  EndDate__c date,
  WeMaintain_ID__c text,
  CurrencyIsoCode text
);

CREATE INDEX ON salesforce.QuoteLineItem (QuoteId);
CREATE INDEX ON salesforce.PricebookEntry (Pricebook2Id);
CREATE INDEX ON salesforce.Repair_Request__c (Quote__c);
CREATE INDEX ON salesforce.Repair_Request__c (RRID__c);

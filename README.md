# OGP Delegator Prototype

A proxy modify html to delegate OGP generation to another server for SPA.

## Structure

```
 Users or Bots            Proxy Server             Content Server         OGP Server


 Request page    ------> Request page    ------> Return page
                                                 with delegator tag
                                                        |
                         Find the tag     <-------------+
                         then fetch OGP
                               |
                               +------------------------------------->  Return OGP tags
                                                                               |
                         Replace the tag  <------------------------------------+
                         with OGP tags
                         and return page
                               |
Recieve response  <------------+
```

---
# theme: apple-basic  
background: /cover.png
lineNumbers: true
drawings:
  persist: false
routerMode: history
selectable: true
remoteAssets: true
colorSchema: 'dark'
layout: cover
canvasWidth: 800
---

# Crafting the Ultimate Docker Image for Spring Applications

<img src="/bellsoft.png" width="200px" class="absolute right-10px bottom-10px"/>

---
layout: image-right
image: 'avatar.jpg'
---
# `whoami`

<v-clicks>

- <div v-after>Pasha Finkelshteyn</div>
- Dev <noto-v1-avocado /> at BellSoft
- ≈10 years in JVM. Mostly <logos-java /> and <logos-kotlin-icon />
- And <logos-spring-icon />
- <logos-twitter /> asm0di0
- <logos-mastodon-icon /> @asm0dey@fosstodon.org

</v-clicks>

---
layout: two-cols-header
---

# BellSoft

::left::

* Vendor of Liberica JDK
* Contributor to the OpenJDK
* Author of ARM32 support in JDK
* Own base images
* Own Linux: Alpaquita

Liberica is the JDK officially recommended by <logos-spring-icon />

<v-click><b>We know our stuff!</b></v-click>

::right::

<img src="/news.png" class="invert rounded self-center"/>

---

# So, what is ultimate?

- Smallest
- Fatsest startup
- Something inbetween

---
layout: statement
---

# So, let's look at all of them!

---

# How do we create an image?

Let's start from trivial.

```docker {none|1|3|4|all}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY . /app
RUN cd /app && ./gradlew build
ENTRYPOINT     java -jar /app/build/libs/spring-petclinic*.jar
```

---

# `Dockerfile` directives

1. Each directive creates a layer of the image.
2. Layers are *immutable*
3. Some layers are zero-sized <span v-click="3">(for example `RUN rm -rf /app`)</span>
<div v-click="1">

```docker {1|3|4}{at:2}
FROM bash

COPY . /app
RUN rm -rf /app
```

</div>
<v-click at="4">

4. We would like image to be light, but it's not :(

</v-click>  
---

# Our `Dockerfile`

```docker {1|3|4|5}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY . /app
RUN cd /app && ./gradlew build
ENTRYPOINT java -jar /app/build/libs/spring-petclinic*.jar
```

---

# Result

```text {18-28|1,17|1,6-16|1,5|1,4|1,3|1,2}{maxHeight:'300px'}
ID         TAG                                                    SIZE      COMMAND
cda5201e70 dumb:latest                                            0B        CMD ["/bin/sh"
74a0788411                                                        512.03MiB /bin/sh -c cd /
7b82eb08ec                                                        67.41MiB  COPY dir:ef251b
e4bcf83d29 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB  |15 BUNDLE_TYPE
<missing>                                                         0B        ENV JAVA_HOME="
<missing>                                                         0B        ENV LANG=en_US.
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL maintaine
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG JAVA_RELEAS
<missing>                                                         7.49MiB   CMD ["/bin/sh"]
<missing>                                                         0B        |9 APK_REPOS= D
<missing>                                                         0B        ADD file:a4d77f
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL maintaine
<missing>                                                         0B        ARG APK_REPOS D
<missing>                                                         0B        ARG APK_REPOS L
<missing>                                                         0B        ARG APK_REPOS L
<missing>                                                         0B        ARG APK_REPOS L
<missing>                                                         0B        ARG LIBC MINIRO
<missing>                                                         0B        ARG MINIROOTFS
```

---
layout: two-cols-header
---

# 579.44 MB are changed on every build!

::left::

Why do we care? We care because:

1. `push` takes longer time to start <br/>(update is longer)
2. `pull` takes longer <br/> (update takes longer & scaling takes longer)

Also, more disk psace is inefficiently used

::right::

<img src="/clocks.png" class="max-h-330px rounded self-center">

---

# Optimizing. Round 1.

Let's build it outside of container

````md magic-move
```docker {3-5}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY . /app
RUN cd /app && ./gradlew build
ENTRYPOINT java -jar /app/build/libs/spring-petclinic*.jar
```
```docker {3-4|all}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY build/libs/spring-petclinic-3.3.0.jar /app/app.jar
CMD java -jar /app/app.jar
```
````

<span v-click="2">Just copying the prebuilt `jar` file</span>

---

# Results

````md magic-move
```plain {1-4}
ID         TAG                                                    SIZE      COMMAND
cda5201e70 dumb:latest                                            0B        CMD ["/bin/sh" "-c" "/app/build/libs/spring-petclinic*.
74a0788411                                                        512.03MiB /bin/sh -c cd /app && ./gradlew build
7b82eb08ec                                                        67.41MiB  COPY dir:ef251bd1e17ac0afee8fa279c87fa2e7a561e3ea2550a2
e4bcf83d29 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB  |15 BUNDLE_TYPE=jdk CDS=no DESCRIPTION=Alpaquita Stream
<missing>                                                         0B        ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-lit
<missing>                                                         0B        ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en
<missing>                                                         0B        LABEL org.opencontainers.image.description="$DESCRIPTIO
<missing>                                                         0B        LABEL org.opencontainers.image.authors="$MAINTAINER"
<missing>                                                         0B        LABEL maintainer="$MAINTAINER"
<missing>                                                         0B        ARG BUNDLE_TYPE CDS DESCRIPTION JAVA_RELEASE MAINTAINER
<missing>                                                         0B        ARG BUNDLE_TYPE CDS JAVA_RELEASE MAINTAINER REMOVE_APK_
<missing>                                                         0B        ARG BUNDLE_TYPE CDS JAVA_RELEASE REMOVE_APK_TOOLS
<missing>                                                         0B        ARG BUNDLE_TYPE CDS JAVA_RELEASE
<missing>                                                         0B        ARG BUNDLE_TYPE JAVA_RELEASE
<missing>                                                         0B        ARG JAVA_RELEASE
<missing>                                                         7.49MiB   CMD ["/bin/sh"]
```
```plain {1-3}
ID         TAG                                                    SIZE     COMMAND
cefb30e21d smarter:latest                                         0B       CMD ["/bin/sh" "-c" "java -jar /app/app.jar"]
46d7594000                                                        58.80MiB COPY file:8d96bee95ae5ce431ee4bc4de6cf0725f36464e95bc0d
e4bcf83d29 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB |15 BUNDLE_TYPE=jdk CDS=no DESCRIPTION=Alpaquita Stream
<missing>                                                         0B       ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-lit
<missing>                                                         0B       ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en
<missing>                                                         0B       LABEL org.opencontainers.image.description="$DESCRIPTIO
<missing>                                                         0B       LABEL org.opencontainers.image.authors="$MAINTAINER"
<missing>                                                         0B       LABEL maintainer="$MAINTAINER"
<missing>                                                         0B       ARG BUNDLE_TYPE CDS DESCRIPTION JAVA_RELEASE MAINTAINER
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE MAINTAINER REMOVE_APK_
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE REMOVE_APK_TOOLS
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE
<missing>                                                         0B       ARG BUNDLE_TYPE JAVA_RELEASE
<missing>                                                         0B       ARG JAVA_RELEASE
<missing>                                                         7.49MiB  CMD ["/bin/sh"]
```
````

---
layout: statement
---

# Saved 500+ MB

## But the build is not clean now :(

<v-click>We have to build everything outside, what if environment affects the build?</v-click>

---
layout: cover
background: cover2.png
---

# Enter build stages

---

# Multi-stage builds

Holy grail of pure builds

* Allow clean builds
* Allow optimal packaging
* Allow different base images

---

# Staged example

```docker {none|1|3|4|6|8}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-slim-musl as runner

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
```

--- 

# Result

```plain {1-4|1-3}{maxHeight:'300px'}
ID         TAG                                                    SIZE     COMMAND                                                 │
6ea7ad11af smarter:latest                                         0B       CMD ["/bin/sh" "-c" "java -jar /app/app.jar"]           │
d6eb71a5df                                                        58.80MiB COPY file:8d96bee95ae5ce431ee4bc4de6cf0725f36464e95bc0da│
c6ede8dac2 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB |15 BUNDLE_TYPE=jdk CDS=no DESCRIPTION=Alpaquita Stream │
<missing>                                                         0B       ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-lite│
<missing>                                                         0B       ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en                  │
<missing>                                                         0B       LABEL org.opencontainers.image.description="$DESCRIPTION│
<missing>                                                         0B       LABEL org.opencontainers.image.authors="$MAINTAINER"    │
<missing>                                                         0B       LABEL maintainer="$MAINTAINER"                          │
<missing>                                                         0B       ARG BUNDLE_TYPE CDS DESCRIPTION JAVA_RELEASE MAINTAINER │
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE MAINTAINER REMOVE_APK_T│
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE REMOVE_APK_TOOLS       │
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE                        │
<missing>                                                         0B       ARG BUNDLE_TYPE JAVA_RELEASE                            │
<missing>                                                         0B       ARG JAVA_RELEASE                                        │
<missing>                                                         7.49MiB  CMD ["/bin/sh"]                                         │
<missing>                                                         0B       |9 APK_REPOS= DESCRIPTION=Alpaquita Stream Musl LIBC=mus│
<missing>                                                         0B       ADD file:14e53548e85f6cc14e8df4238bba40aebf74e9ca0feb8ec│
<missing>                                                         0B       LABEL org.opencontainers.image.description="$DESCRIPTION│
<missing>                                                         0B       LABEL org.opencontainers.image.authors="$MAINTAINER"    │
<missing>                                                         0B       LABEL maintainer="$MAINTAINER"                          │
<missing>                                                         0B       ARG APK_REPOS DESCRIPTION LIBC LOCALES MAINTAINER MINIRO│
<missing>                                                         0B       ARG APK_REPOS LIBC LOCALES MAINTAINER MINIROOTFS        │
<missing>                                                         0B       ARG APK_REPOS LIBC LOCALES MINIROOTFS                   │
<missing>                                                         0B       ARG APK_REPOS LIBC MINIROOTFS                           │
<missing>                                                         0B       ARG LIBC MINIROOTFS                                     │
<missing>                                                         0B       ARG MINIROOTFS                                          │
                                                                                                                                   │
```

---
layout: statement
---

# That's all folks!

<h2 v-click>Or is it?</h2>

---

# What's these 59 MiB?

We have to pull 59 MiB of petclinic on every small commit!

Is there a way to optimize it?

---

# Layers!

```docker {1-4|6|8,9|10|12,6|15-18|14}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-slim-musl as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Djarmode=tools -jar /app/app.jar extract --layers --launcher

FROM bellsoft/liberica-runtime-container:jre-slim-musl as runner

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
COPY --from=optimizer /app/app/dependencies/ ./
COPY --from=optimizer /app/app/spring-boot-loader/ ./
COPY --from=optimizer /app/app/snapshot-dependencies/ ./
COPY --from=optimizer /app/app/application/ ./
```
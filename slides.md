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

# Result

```text {none|18-28|17|6-16|5|4|3|2}{maxHeight:'300px'}
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